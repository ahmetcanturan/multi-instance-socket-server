module.exports = {
  apps: [
    {
      name: "socket-server",
      script: "./dist/server.js",
      instances: 3,
      exec_mode: "cluster",
    },
  ],
};
