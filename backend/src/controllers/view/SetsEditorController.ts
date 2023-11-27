import { Body, Controller, Delete, Get, Post, Render } from '@nestjs/common';
import { SetsRepository } from '../../db/SetsRepository.js';

@Controller("sets")
export class SetsEditorController {
    constructor(private readonly repository: SetsRepository) {
        console.log("Sets editor controller loaded");
    }

    @Get("list")
    @Render("setsList")
    async getUsersList() {
        return {
            sets: await this.repository.getSetsList()
        }
    }
}
