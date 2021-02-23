const { 
    register,
    forgotPassword
} = require('../../../controllers/auth');
const supertest = require('supertest')
const app = require("../../../server");
const db = require("../../../models");

describe("User", () => {

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
            .post('/v1/auth/user')
            .send({ name, lastName, email, password, sendEmail })
        
        this.validationToken = response.body.validationToken;

        expect(response.status).toBe(201);
        expect(response.body).toBeTruthy();
    });

    it("check if the user already exists", async () => {

        const response = await supertest(app)
            .post('/v1/auth/user')
            .send({ email, password })

        expect(response.status).toBe(401);
    });

    it("wrong register confirmation", async () => {

        const response = await supertest(app)
            .put(`/v1/auth/email/confirmation?evldr=adadada${this.validationToken}dadadadad`);

        expect(response.status).toBe(401);
        expect(response.body.success).not.toBeTruthy();
    });

    it("register confirmation", async () => {

        const response = await supertest(app)
            .put(`/v1/auth/email/confirmation?evldr=${this.validationToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBeTruthy();
    });

    it("login", async () => {

        const response = await supertest(app)
            .post('/v1/auth/login')
            .send({ email , password });
        
        this.token = response.body.token;

        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    });

    it("getMe which exists", async () => {

        const response = await supertest(app)
            .get('/v1/auth/user')
            .auth(this.token, { type: 'bearer' });
        
        console.log(response.body)

        expect(response.status).toBe(200);
        expect(response.body).toEqual({email: 'aldc30sc@gmail.com', name: 'Alvaro', id: 1, "lastName": "Losada de Castro" });
    });

    it("getMe error", async () => {
        const wrongToken = this.token.slice(0, -1) + 'a';

        const response = await supertest(app)
            .get('/v1/auth/user')
            .auth(wrongToken, { type: 'bearer' });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('ERROR.AUTH.USER-NOT-FOUND');
    });

    it("request new password / forgot password", async () => {

        const response = await supertest(app)
            .post(`/v1/auth/password/request`)
            .send({ email, sendEmail });

        this.newPasswordRequestedToken = response.body.newPasswordToken;

        expect(this.validationToken).not.toBeNull();
        expect(response.status).toBe(200);
    });

    it("update forgotten password", async () => {

        console.log(this.newPasswordRequestedToken)

        const response = await supertest(app)
            .put(`/v1/auth/password/create?pvldr=${this.newPasswordRequestedToken}`)
            .send({ newPassword });

        expect(response.status).toBe(200);
        expect(response.body.success).toBeTruthy();
    });

    afterAll(async () => {
        await thisDb.sequelize.close()
    })
});