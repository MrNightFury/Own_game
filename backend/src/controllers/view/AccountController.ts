import { Body, Controller, Delete, Get, Post, Render } from '@nestjs/common';
import { SetsRepository } from '../../db/SetsRepository.js';

@Controller("account")
export class AccountControler {
    constructor(private readonly repository: SetsRepository) {
        console.log("Account controller loaded");
    }

    @Get("login")
    @Render("loginPage")
    async getUsersList() {}
}
