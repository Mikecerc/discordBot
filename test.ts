import mongoose from "mongoose";
import DatabaseParodyCollection from "./src/classes/databaseParodyCollection";
import { Collection } from "discord.js";
interface tempData {
    name: string;
    age: number;
    id: string;
}
(async () => {
    //let a = new DatabaseParodyCollection<string,tempData>();
    // console.log(await a.sync());
    //console.log([].length)

    await mongoose
        .connect("mongodb://192.168.30.2:27017/test")
        .then(() => {
            console.log("Connected to the database");
        })
        .catch((e) => {
            console.log(e);
        });
    let testCol = new Collection<string, tempData>();
    const data = new DatabaseParodyCollection<string, tempData>("test1");
    await data.init();

    console.log("test1:");
    data.set("1", { name: "John", age: 20, id: "1" });
    console.log(data, "\n\n\n");
    await data.save();
    /*
   console.log("test2")
   data.set("1", {name: "Rich", age: 25, id: "2"});
   console.log(data,"\n\n\n")
   await data.save();

    console.log("test3")
    data.delete("1");
    console.log(data,"\n\n\n" )
    await data.save();
  */
})();
