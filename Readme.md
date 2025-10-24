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
curl -X POST http://localhost:8080/list \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Groceries\"}"

## Get all lists
curl -X GET http://localhost:8080/lists

## Delete a list and all its items by ID (listID 1 in example)
curl -X DELETE http://localhost:8080/lists/1

## Add a new item to a list by list ID (listID 1 in example)
curl -X POST http://localhost:8080/lists/1/items \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Milk\", \"quantity\": 2, \"section\": \"Dairy\"}"

## Get all items from a list by list ID (listID 1 in example)
curl -X GET http://localhost:8080/lists/1/items

## Update an existing item (listID and itemID both 1 in example)
curl -X PUT http://localhost:8080/lists/1/items/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Eggs XL\", \"quantity\": 12}"

## Delete an item (listID and itemID both 1 in example)
curl -X DELETE http://localhost:8080/lists/1/items/1

## Toggle an item as bought / not bought (listID and itemID both 1 in example)
curl -X PATCH http://localhost:8080/lists/1/items/1/toggle

<!-- todo:
    Initial frontend
 -->
 <!-- todo:
 initial mongodb
  -->
  <!-- todo:
  easter eggs
   -->
   <!-- todo:
   enter to submit items, refactor detailspage to components
    -->