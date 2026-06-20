import { Injectable } from "@nestjs/common";

import { sleep } from "../../common/utils";

@Injectable()
export class MockOpenAiService {
  async complete( question: string ) {
    //mocking a delay of 1 second, mimicking the actual OpenAI API delay
    await sleep( 1000 );

    return {
      answer: `Mock response to: ${question}`,
      tokens: 100,
    };
  }
}
