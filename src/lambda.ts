import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from "aws-lambda"
import serverless from "serverless-http"
import App from "./app"

const app = new App().app

const handler = serverless(app)

export const lambdaHandler = async (
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyStructuredResultV2> => {
  // Set context for proper Lambda execution
  context.callbackWaitsForEmptyEventLoop = false

  return await handler(event, context)
}
