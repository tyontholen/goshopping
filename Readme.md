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


Future feature ideas:
Icons and drop-down-menu for each section of the store (diary, meat, bread, snacks, freezer etc)
Special effects when special groceries are checked done, like potato chips


// curls for testing API

## Create a new shopping list
curl -X POST http://localhost:8080/list

## Add a new item
curl -X POST http://localhost:8080/items

## Get all items
curl -X GET http://localhost:8080/items

## Get item by ID
curl -X GET http://localhost:8080/items/{id}

## Update an existing item
curl -X PUT http://localhost:8080/items/{id}

## Delete an item
curl -X DELETE http://localhost:8080/items/{id}

## Toggle an item as bought, or not
curl -X PATCH http://localhost:8080/items/{id}/toggle