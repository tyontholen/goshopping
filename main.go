package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

// Data structs for Items and List

type Item struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Section  string `json:"section"` // section such as diary, vegetables, canned goods, bread etc. Will not be mandatory/be given a placeholder value
	Quantity int    `json:"quantity"`
	Bought   bool   `json:"bought"`
}

type List struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Items []Item `json:"items"`
}

// In-memory data, temp storage
// changing up variables to work with both items and lists
var lists []List
var nextListID = 1
var nextItemID = 1

// Handlers

// POST /list - create a new list
func createListHandler(w http.ResponseWriter, r *http.Request) {
	var newList List
	err := json.NewDecoder(r.Body).Decode(&newList)
	if err != nil || strings.TrimSpace(newList.Name) == "" {
		http.Error(w, "invalid request body or missing name", http.StatusBadRequest)
		return
	}

	// check for duplicates
	newName := strings.ToLower(strings.TrimSpace(newList.Name))
	for _, list := range lists {
		if strings.ToLower(list.Name) == newName {
			http.Error(w, "list with this name already exists", http.StatusConflict)
			return
		}
	}

	newList.ID = fmt.Sprintf("%d", nextListID)
	nextListID++

	lists = append(lists, newList)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newList)
}

// POST /lists/{listID}/items - to add an item to a list
func addItemToListHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	listID := vars["listID"]

	// find the list
	for li, l := range lists {
		if l.ID == listID {
			var newItem Item
			if err := json.NewDecoder(r.Body).Decode(&newItem); err != nil {
				http.Error(w, "invalid request body", http.StatusBadRequest)
				return
			}
			// check for duplicates, ignoring extra spaces and not case sesestive
			newName := strings.ToLower(strings.TrimSpace(newItem.Name))
			for _, item := range l.Items {
				if strings.ToLower(strings.TrimSpace(item.Name)) == newName {
					http.Error(w, "item with this name already exists", http.StatusConflict)
					return
				}
			}
			// auto ID and default Bought to false
			newItem.ID = fmt.Sprintf("%d", nextItemID)
			newItem.Bought = false
			nextItemID++

			lists[li].Items = append(lists[li].Items, newItem)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(newItem)
			return

		}
	}
	http.Error(w, "list not found", http.StatusNotFound)
}

// GET /lists/{listID}/items - get all items of a list
func getItemsFromListHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	listID := vars["listID"]

	for _, l := range lists {
		if l.ID == listID {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(l.Items)
			return
		}
	}

	http.Error(w, "list not found", http.StatusNotFound)
}

// Commenting out, not needed
// GET /items/{id} - get one item by ID
// func getItemByIDHandler(w http.ResponseWriter, r *http.Request) {
// 	vars := mux.Vars(r)
// 	id := vars["id"]

// 	for _, item := range items {
// 		if item.ID == id {
// 			w.Header().Set("Content-Type", "application/json")
// 			json.NewEncoder(w).Encode(item)
// 			return
// 		}
// 	}
// 	http.Error(w, "item not found", http.StatusNotFound)
// }

// PUT /lists/{listID}/items/{itemID} - update item by ID in list
func updateItemInListHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	listID := vars["listID"]
	itemID := vars["itemID"]

	var updated Item
	if err := json.NewDecoder(r.Body).Decode(&updated); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	for li, l := range lists {
		if l.ID == listID {
			for i, item := range l.Items {
				if item.ID == itemID {
					// update allowed fields
					if updated.Name != "" {
						lists[li].Items[i].Name = updated.Name
					}
					if updated.Section != "" {
						lists[li].Items[i].Section = updated.Section
					}
					if updated.Quantity > 0 {
						lists[li].Items[i].Quantity = updated.Quantity
					}

					w.Header().Set("Content-Type", "application/json")
					json.NewEncoder(w).Encode(lists[li].Items[i])
					return
				}
			}
			http.Error(w, "item not found", http.StatusNotFound)
			return
		}
	}
	http.Error(w, "list not found", http.StatusNotFound)
}

// DELETE /lists{listID}/items/{itemID} - delete an item by ID
func deleteItemInListHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	listID := vars["listID"]
	itemID := vars["itemID"]

	for li, l := range lists {
		if l.ID == listID {
			for i, item := range l.Items {
				if item.ID == itemID {
					lists[li].Items = append(l.Items[:i], l.Items[i+1:]...)
					w.WriteHeader(http.StatusNoContent)
					return
				}
			}
			http.Error(w, "item not found", http.StatusNotFound)
			return
		}
	}
	http.Error(w, "list not found", http.StatusNotFound)
}

// PATCH /lists{listID}/items/{itemID}/toggle - toggle bought status by ID
func toggleItemInListHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	listID := vars["listID"]
	itemID := vars["itemID"]

	for li, l := range lists {
		if l.ID == listID {
			for i, item := range l.Items {
				if item.ID == itemID {
					lists[li].Items[i].Bought = !item.Bought
					w.Header().Set("Content-Type", "application/json")
					json.NewEncoder(w).Encode(lists[li].Items[i])
					return
				}
			}
			http.Error(w, "item not found", http.StatusNotFound)
		}
	}
	http.Error(w, "list not found", http.StatusNotFound)
}

func main() {
	r := mux.NewRouter()
	//endpoints
	r.HandleFunc("/list", createListHandler).Methods("POST")

	r.HandleFunc("/lists/{listID}/items", getItemsFromListHandler).Methods("GET")
	r.HandleFunc("/lists/{listID}/items", addItemToListHandler).Methods("POST")
	// r.HandleFunc("/items/{id}", getItemByIDHandler).Methods("GET")
	r.HandleFunc("/lists/{listID}/items/{itemID}", updateItemInListHandler).Methods("PUT")
	r.HandleFunc("/lists/{listID}/items/{itemID}", deleteItemInListHandler).Methods("DELETE")
	r.HandleFunc("/lists/{listID}/items/{itemID}/toggle", toggleItemInListHandler).Methods("PATCH")

	fmt.Println("Server running on: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
