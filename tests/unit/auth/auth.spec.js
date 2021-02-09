const { 
    register,
    forgotPassword
} = require('../../../controllers/auth');
const supertest = require('supertest')
const app = require("../../../server");
const db = require("../../../models");

//db.Users.create = jest.fn();

/*describe("call with mocks", () => {
    it("call with mocks", () =>
        const { name, lastName, email, password,  } = {
            name: "Alvaro",
            lastName: "Losada de Castro",
            email: "aldc30sc@gmail.com",
            password: "123456",
            emailConfirmed: false
        };

        register();
        expect(db.Users.create).toBeCalled();
    }):
});*/

let validationToken = null;

describe("register a new user", () => {

    let thisDb = db;
    const { name, lastName, email, password, sendEmail } = {
        name: "Alvaro",
        lastName: "Losada de Castro",
        email: "aldc30sc@gmail.com",
        password: "A123alvaro",
        sendEmail: "no", // do not send and e-mail if testing
    };

    beforeAll(async () => {
        await thisDb.sequelize.sync({ force: true })
    })
    
    it("create a new user", async () => {

        const response = await supertest(app)
            .post('/v1/auth/register')
            .send({ name, lastName, email, password, sendEmail })
        
        this.validationToken = response.body.data.validationToken;

        expect(response.status).toBe(200);
        expect(response.body.success).toBeTruthy();
    });

    it("check if the user already exists", async () => {

        const response = await supertest(app)
            .post('/v1/auth/register')
            .send({ email, password })

        expect(response.status).toBe(401);
    });

    it("wrong register confirmation", async () => {

        const response = await supertest(app)
            .post(`/v1/auth/confirmRegister?evldr=adadada${this.validationToken}dadadadad`);

        expect(response.status).toBe(401);
        expect(response.body.success).not.toBeTruthy();
    });

    it("register confirmation", async () => {

        const response = await supertest(app)
            .post(`/v1/auth/confirmRegister?evldr=${this.validationToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBeTruthy();
    });

    it("login", async () => {

        const response = await supertest(app)
            .post('/v1/auth/login')
            .send({ email , password })

        expect(response.status).toBe(200);
        expect(response.body.success).toBeTruthy();
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