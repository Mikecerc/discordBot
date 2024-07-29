import { Collection } from "discord.js";
import { HydratedDocument, Model, Schema, model } from "mongoose";

interface IRecord<k, v> {
  key: k;
  value: v;
};
/**
  * @type k: a string that represents the name of the collection. This will be used to create the collection in the database
  * @type v: an interface that will be used to construct the the schema of the collections documents\
  */
export default class DatabaseParodyCollection<k, v> extends Collection<k, v> {
  public schema: Schema<IRecord<k, v>>;
  public model: Model<IRecord<k, v>>;
  private previousCachedData: Collection<k, v>;

  /**
   * Constructor for the DatabaseParodyCollection class
   * @param name the name of the collection in the database
   * @returns a new instance of the DatabaseParodyCollection class
   */
  constructor(name: string) {
    super();
    //dynamically create the schema for the collection
    //Im not sure If I like using a non-strict schema, however I dont want to have to manully define the schema for each collection. 
    //for now, this will be the best way to dynamically create it from an interface. Will look into later. Should be type safe (enough)
    this.schema = new Schema<IRecord<k, v>>({},{strict: false});
    this.model = model<IRecord<k, v>>(name, this.schema);

    //define a cache for the previously saved data. This is used to generate a diff, and thus update the database faster.
    this.previousCachedData = new Collection<k, v>([]);

  }

  /**
   * Initialize the collection with the items in the database
   */
  public async init() {
    // Initialize the collection with the items in the database
    await this.sync();
  }

  /**
   * Sync the collection with the database
   * Note: This method is protected and should not be called directly. It will overwrite the current collection with the data in the database
   */
  protected async sync() {

    await this.loadModels().then((currentModels) => {
      currentModels.forEach((model) => {
        this.set(model.key, model.value);
      });
    });
  }

  /**
   * Save the cached colelction to the database
   */
  public async save() {
    // Save the collection to the database using the diff between the current collection and the previous collection
    let temp = new Collection<k, v>(this);

    //generate a new collection containing all added items
    let positiveDiff = this.previousCachedData.merge(temp,
      _ => ({ keep: false }),
      y => ({ keep: true, value: y }),
      () => ({ keep: false })
    );

    //generate a new collection containing all removed items
    let negativeDiff = this.previousCachedData.merge(temp,
      x => ({ keep: true, value: x }),
      _ => ({ keep: false }),
      () => ({ keep: false })
    );

    // generate a new collection containing all changed items
    let changes = this.previousCachedData.merge(temp,
      _ => ({ keep: false }),
      _ => ({ keep: false }),
      (x, y) => x != y ? ({ keep: true, value: y }) : ({ keep: false })
    )

    this.previousCachedData = temp;
    // update the documents accordingly
    await this.updateDocuments(positiveDiff, negativeDiff, changes);
  }

  /**
   * @param positiveDiff The collection containing all the added items
   * @param negativeDiff The collection containing all the removed items
   * @param changes The collection containing all the changed items
   */
  private async updateDocuments(positiveDiff: Collection<k, v>, negativeDiff: Collection<k, v>, changes: Collection<k, v | undefined>
  ): Promise<boolean> {
    // Update the database with the changes
    console.log("positiveDiff: ", positiveDiff.size)
    console.log("negativeDiff: ", negativeDiff.size)
    console.log("changes: ", changes.size)
    if (positiveDiff.size > 0) {
      console.log(this.schema.indexes())
      //console.log(positiveDiff.map((key, value) => { return { key: key, value: value } }))
      await this.model.insertMany(positiveDiff.map((key, value) => { return { key: key, value: value } }
      )).catch((error) => { throw new Error(error) });
      await this.model.find({}).then((data) => {
        console.log("data: ", data)
      })
    }

    if (negativeDiff.size > 0) {
      await this.model.deleteMany(negativeDiff.map((key, value) => { return { key: key, value: value } }
      )).catch((error) => { throw new Error(error) });
    }

    if (changes != undefined && changes.size > 0) {
      await this.model.updateMany(changes.map((key, value) => { return { key: key, value: value } }
      )).catch((error) => { throw new Error(error) });
    }

    return true;
  }

  /**
   * @returns a promise that resolves to an array of hydrated documents
   */
  private async loadModels(): Promise<HydratedDocument<IRecord<k, v>>[]> {
    // Load the models from the database
    return await this.model.find({}).catch((error) => { throw new Error(error) });
  }

}
