const { 
    forgotPassword
} = require('../../../controllers/auth');
const supertest = require('supertest')
const app = require("../../../server");
const db = require("../../../models");

describe("register a new user", () => {

    let thisDb = db

    beforeAll(async () => {
        await thisDb.sequelize.sync({ force: true })
    })
    
    it("create a new user", async () => {
        const { email, password } = {
            email: "aldc30sc@gmail.com",
            password: "123456"
        };

        const response = await supertest(app)
            .post('/v1/auth/register')
            .send({email, password})

        expect(response.status).toBe(200);
    });

    it("check if the user already exists", async () => {
        const { email, password } = {
            email: "aldc30sc@gmail.com",
            password: "123456"
        };

        const response = await supertest(app)
            .post('/v1/auth/register')
            .send({email, password})

        expect(response.status).toBe(401);
    });

    afterAll(async () => {
        await thisDb.sequelize.close()
    })
});

describe("forgotPassword()", () => {
    it("should return true", () => {
        //Testing a boolean
        expect(forgotPassword()).toBeTruthy();
        //Another way to test a boolean
        expect(forgotPassword()).toEqual(true);
    });
});