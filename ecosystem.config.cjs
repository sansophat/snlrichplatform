module.exports = {
  apps: [
    {
      name: "snlrich",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      autorestart: true,
      max_memory_restart: "600M",
      env: { NODE_ENV: "production" },
    },
  ],
};
