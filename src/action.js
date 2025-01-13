const core = require("@actions/core");
const axios = require("axios");

const apiVersion = "v1.41";

const pullImagesAction = async (
  http,
  token,
  nodeId,
  pullImages,
  registryId
) => {
  for (const pullImage of pullImages) {
    const endpoint = `/api/endpoints/${nodeId}/docker/${apiVersion}/images/create`;
    const encodedAPIAuth = registryId
      ? Buffer.from(
          JSON.stringify({
            registryId: parseInt(registryId),
          })
        ).toString("base64")
      : undefined;

    await http.post(endpoint, null, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": token,
        "X-Registry-Auth": encodedAPIAuth,
      },
      params: {
        fromImage: pullImage,
      },
    });

    core.info(`Image ${pullImage} pulled successfully`);
  }

  core.info("Images pulled successfully");
};

const handleStackAction = async (http, token, nodeId, stackId, action) => {
  const endpoint = `/api/stacks/${stackId}/${action}`;

  await http.post(endpoint, null, {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": token,
    },
    params: {
      endpointId: nodeId,
    },
  });

  core.info(`Stack ${action} successfully`);
};

const main = async () => {
  const url = core.getInput("url");
  const token = core.getInput("token");
  const nodeId = core.getInput("node_id");
  const pullImages = core.getInput("pull_images").split(",").filter(Boolean);
  const registryId = core.getInput("registry_id");

  const startStack = core.getInput("start_stack");
  const stopStack = core.getInput("stop_stack");

  const http = axios.create({
    baseURL: url,
  });

  if (pullImages.length) {
    await pullImagesAction(http, token, nodeId, pullImages, registryId);
  }

  if (startStack) {
    await handleStackAction(http, token, nodeId, startStack, "start");
  }

  if (stopStack) {
    await handleStackAction(http, token, nodeId, stopStack, "stop");
  }

  core.info("Action completed successfully");
};

main().catch((error) => core.setFailed(`Error: ${error.stack}`));
