Shopping list app

Go backend
React.js frontend, styled with MUI
MongoDB backend

Features:
Create lists
Add items
Update items details like name, quantity
Delete items - remove an item from the list
Update items with status bought or not


// curls for testing API

## Create a new shopping list
curl -X POST http://localhost:8080/list

## Add a new item
curl -X POST http://localhost:8080/items

## Update an existing item
curl -X PUT http://localhost:8080/items/

## Delete an item
curl -X DELETE http://localhost:8080/items/delete

## Toggle an item as bought, or not
curl -X PATCH http://localhost:8080/items/toggle