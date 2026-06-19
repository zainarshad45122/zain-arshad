import { Injectable } from "@nestjs/common";

function sleep( ms: number ) {
  return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
}

@Injectable()
export class MockOpenAiService {
  async complete( question: string ) {
    const delay = 500 + Math.random() * 1000;
    await sleep( delay );

    return {
      answer: `Mock response to: ${question}`,
      tokens: Math.floor( 50 + Math.random() * 200 ),
    };
  }
}
