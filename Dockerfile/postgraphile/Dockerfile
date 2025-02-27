FROM node:lts-alpine

USER node
WORKDIR /home/node

RUN npm i postgraphile@beta @graphile/simplify-inflection@beta @graphile-contrib/pg-omit-archived@v4.0.0-beta.3 postgraphile-plugin-connection-filter@beta

ENTRYPOINT ["npx", "postgraphile"]

HEALTHCHECK --interval=10s --timeout=5s --start-period=1s --retries=3 \
  CMD wget --quiet \
    --header="Content-Type: application/json" \
    --post-data='{"query": "{ __typename }"}' \
    -O - http://localhost:${GRAPHQL_PORT}/graphql | grep -q '"data"'
