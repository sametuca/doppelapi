import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPI } from 'openapi-types';

export async function parseOpenAPIFile(filePath: string): Promise<OpenAPI.Document> {
  try {
    console.log(`Parsing OpenAPI file: ${filePath}`);
    
    // Validate and dereference the OpenAPI document
    const api = await SwaggerParser.dereference(filePath) as OpenAPI.Document;
    
    console.log(`✓ API: ${api.info.title} (v${api.info.version})`);
    console.log(`✓ Valid OpenAPI document`);
    
    return api;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse OpenAPI file: ${error.message}`);
    }
    throw new Error('Failed to parse OpenAPI file: Unknown error');
  }
}

export async function validateOpenAPIFile(filePath: string): Promise<OpenAPI.Document> {
  try {
    const api = await SwaggerParser.validate(filePath) as OpenAPI.Document;
    console.log(`✓ Valid OpenAPI document`);
    return api;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid OpenAPI file: ${error.message}`);
    }
    throw new Error('Invalid OpenAPI file: Unknown error');
  }
}
