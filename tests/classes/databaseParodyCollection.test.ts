import { expect } from "chai";
import DatabaseParodyCollection from "../../src/classes/databaseParodyCollection";
import mongoose from "mongoose";
import dotenv from "dotenv";

describe("DatabaseParodyCollection", function () {
    let url_string: string;
    before(async function () {
        dotenv.config();
        url_string = (process.env.DB_URL as string) + process.env.TEST_DB;
        await mongoose.connect(url_string);
    });

    beforeEach(async function () {
        if (mongoose.models["testmodel"]) {
            mongoose.deleteModel("testmodel");
        }
        await mongoose.connection.collection("testmodels").drop();
    });

    after(async function () {
        await mongoose.connection.collection("testmodels").drop();
        await mongoose.disconnect();
    });

    it("should add items and save to the database", async function () {
        const dbCollection = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        dbCollection.set("key1", "value1");
        dbCollection.set("key2", "value2");
        await dbCollection.save();

        const models = await dbCollection.loadDocuments();
        expect(
            models.map((model: any) => ({
                key: model.key,
                value: model.value,
            })),
        ).to.deep.equal([
            { key: "key1", value: "value1" },
            { key: "key2", value: "value2" },
        ]);
        dbCollection.clear();
        await dbCollection.save();
    });

    it("should remove items and save to the database", async function () {
        const dbCollection = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        dbCollection.set("key1", "value1");
        dbCollection.set("key2", "value2");
        await dbCollection.save();

        const models1 = await dbCollection.loadDocuments();
        expect(
            models1
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([
            { key: "key1", value: "value1" },
            { key: "key2", value: "value2" },
        ]);

        dbCollection.delete("key1");
        await dbCollection.save();

        const models2 = await dbCollection.loadDocuments();
        expect(
            models2
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([{ key: "key2", value: "value2" }]);
        dbCollection.clear();
        await dbCollection.save();
    });

    it("should modify items and save to the database", async function () {
        const dbCollection = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        dbCollection.set("key1", "value1");
        await dbCollection.save();

        const models1 = await dbCollection.loadDocuments();
        expect(
            models1.map((model: any) => ({
                key: model.key,
                value: model.value,
            }))[0],
        ).to.deep.equal({ key: "key1", value: "value1" });

        dbCollection.set("key1", "newValue1");
        await dbCollection.save();

        const models2 = await dbCollection.loadDocuments();
        expect(
            models2.map((model: any) => ({
                key: model.key,
                value: model.value,
            })),
        ).to.deep.equal([{ key: "key1", value: "newValue1" }]);

        dbCollection.clear();
        await dbCollection.save();
    });

    it("should handle combinations of add, remove, and modify before save", async function () {
        const dbCollection = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        dbCollection.set("key1", "value1");
        dbCollection.set("key2", "value2");
        dbCollection.set("key3", "value3");
        await dbCollection.save();
        const models1 = await dbCollection.loadDocuments();
        expect(
            models1
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([
            { key: "key1", value: "value1" },
            { key: "key2", value: "value2" },
            { key: "key3", value: "value3" },
        ]);

        dbCollection.delete("key2");
        dbCollection.set("key1", "newValue1");
        dbCollection.set("key4", "value4");
        await dbCollection.save();

        const models2 = await dbCollection.loadDocuments();
        expect(
            models2
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([
            { key: "key1", value: "newValue1" },
            { key: "key3", value: "value3" },
            { key: "key4", value: "value4" },
        ]);

        dbCollection.clear();
        await dbCollection.save();
    });
    it("should clear all items and save to the database", async function () {
        const dbCollection = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        dbCollection.set("key1", "value1");
        dbCollection.set("key2", "value2");
        await dbCollection.save();

        const models1 = await dbCollection.loadDocuments();
        expect(
            models1
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([
            { key: "key1", value: "value1" },
            { key: "key2", value: "value2" },
        ]);

        dbCollection.clear();
        await dbCollection.save();

        const models2 = await dbCollection.loadDocuments();
        expect(
            models2
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([]);
        dbCollection.clear();
        await dbCollection.save();
    });

    it("should not save if no changes were made", async function () {
        const dbCollection = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        await dbCollection.save();

        const models = await dbCollection.loadDocuments();
        expect(
            models
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([]);
        dbCollection.clear();
        await dbCollection.save();
    });
    it("should close the database, start it again, and create a new collection, initializing it with previous data", async function () {
        const dbCollection = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        dbCollection.set("key1", "value1");
        dbCollection.set("key2", "value2");
        await dbCollection.save();

        const models1 = await dbCollection.loadDocuments();
        expect(
            models1
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([
            { key: "key1", value: "value1" },
            { key: "key2", value: "value2" },
        ]);

        await mongoose.disconnect();

        await mongoose.connect(url_string);
        mongoose.deleteModel("testmodel");

        const dbCollection2 = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        const models2 = await dbCollection2.loadDocuments();
        expect(
            models2
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([
            { key: "key1", value: "value1" },
            { key: "key2", value: "value2" },
        ]);

        //get collection values and check that its empty
        expect(
            dbCollection2.map((v, k) => ({ key: k, value: k })).sort(),
        ).to.deep.equal([]);
        await dbCollection2.init();

        //get collection values and check that its not empty
        expect(
            dbCollection2.map((v, k) => ({ key: k, value: v })),
        ).to.deep.equal([
            { key: "key1", value: "value1" },
            { key: "key2", value: "value2" },
        ]);

        await dbCollection2.save();
    });
    it("should handle empty collection", async function () {
        const dbCollection = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        await dbCollection.save();

        const models = await dbCollection.loadDocuments();
        expect(
            models
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([]);
        dbCollection.clear();
        await dbCollection.save();
    });

    it("should handle duplicate keys", async function () {
        const dbCollection = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        dbCollection.set("key1", "value1");
        dbCollection.set("key1", "value2");
        await dbCollection.save();

        const models = await dbCollection.loadDocuments();
        expect(
            models
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([{ key: "key1", value: "value2" }]);
        dbCollection.clear();
        await dbCollection.save();
    });

    it("should handle large number of items", async function () {
        const dbCollection = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        for (let i = 0; i < 1000; i++) {
            dbCollection.set(`key${i}`, `value${i}`);
        }
        await dbCollection.save();

        const models = await dbCollection.loadDocuments();
        const expectedModels: {}[] = [];
        for (let i = 0; i < 1000; i++) {
            expectedModels.push({ key: `key${i}`, value: `value${i}` });
        }
        expect(
            models
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal(expectedModels);
        dbCollection.clear();
        await dbCollection.save();
    });

    it("should handle special characters in keys and values", async function () {
        const dbCollection = new DatabaseParodyCollection<string, any>(
            "testmodel",
        );
        dbCollection.set("key1", "value1");
        dbCollection.set("key@#$%^&*()", "value@#$%^&*()");
        dbCollection.set("key2", "value2");
        await dbCollection.save();

        const models = await dbCollection.loadDocuments();
        expect(
            models
                .map((model: any) => ({ key: model.key, value: model.value }))
                .sort(),
        ).to.deep.equal([
            { key: "key1", value: "value1" },
            { key: "key@#$%^&*()", value: "value@#$%^&*()" },
            { key: "key2", value: "value2" },
        ]);
        dbCollection.clear();
        await dbCollection.save();
    });
});
