const { 
    register,
    forgotPassword
} = require('../../../controllers/auth');
const supertest = require('supertest')
const app = require("../../../server");
const db = require("../../../models");

describe("register a new user", () => {

    let thisDb = db;
    const { name, lastName, email, password, sendEmail, newPassword } = {
        name: "Alvaro",
        lastName: "Losada de Castro",
        email: "aldc30sc@gmail.com",
        password: "A123alvaro",
        sendEmail: "no", // do not send and e-mail if testing
        newPassword: "A456alvaro"
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

    it("request new password / forgot password", async () => {

        const response = await supertest(app)
            .post(`/v1/auth/forgotPassword`)
            .send({ email, sendEmail });

        this.newPasswordRequestedToken = response.body.data.newPasswordToken;

        expect(this.validationToken).not.toBeNull();
        expect(response.status).toBe(200);
        expect(response.body.success).toBeTruthy();
    });

    it("update forgotten password", async () => {

        const response = await supertest(app)
            .post(`/v1/auth/updateForgottenPassword?pvldr=${this.newPasswordRequestedToken}`)
            .send({ newPassword });

        expect(response.status).toBe(200);
        expect(response.body.success).toBeTruthy();
    });

    afterAll(async () => {
        await thisDb.sequelize.close()
    })
});