FROM haveagitgat/tdarr_node:latest

RUN \
  apt-get update && \
  apt-get install -y \
    libnvidia-gl-565-server && \
  rm -rf /var/lib/apt/lists/*