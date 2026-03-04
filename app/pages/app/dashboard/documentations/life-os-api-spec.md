# Life OS Module --- API Spec

Base path:

/api/v1/life

------------------------------------------------------------------------

## Daily Dashboard

GET /life/dashboard/today

Response

{ "habits":\[\], "tasks":\[\], "events":\[\], "journal":{} }

------------------------------------------------------------------------

## Link Entities

POST /life/link

{ "sourceType":"goal", "sourceId":"uuid", "targetType":"habit",
"targetId":"uuid" }

------------------------------------------------------------------------

## Life Areas

GET /life/areas

POST /life/areas

{ "name":"Health" }

------------------------------------------------------------------------

## Get Productivity Insights

GET /life/insights
