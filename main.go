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
var items []Item
var nextID = 1

// Handlers

// handler to create a list
// todo: lists functionality
func createListHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "create list - not implemented yet")
}

// GET /items - get all items of a list
func getItemsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// POST /items - to add an item to a list
func addItemHandler(w http.ResponseWriter, r *http.Request) {
	var newItem Item
	err := json.NewDecoder(r.Body).Decode(&newItem)
	if err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// check for duplicates, ignoring extra spaces and not case sesestive
	newName := strings.ToLower(strings.TrimSpace(newItem.Name))
	for _, item := range items {
		if strings.ToLower(strings.TrimSpace(item.Name)) == newName {
			http.Error(w, "item with this name already exists", http.StatusConflict)
			return
		}
	}

	// auto ID and default Bought to false
	newItem.ID = fmt.Sprintf("%d", nextID)
	newItem.Bought = false
	nextID++

	items = append(items, newItem)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newItem)
}

// GET /items/{id} - get one item by ID
func getItemByIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	for _, item := range items {
		if item.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(item)
			return
		}
	}
	http.Error(w, "item not found", http.StatusNotFound)
}

// PUT /items/{id} - update item by ID
func updateItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var updated Item
	err := json.NewDecoder(r.Body).Decode(&updated)
	if err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	for i, item := range items {
		if item.ID == id {
			items[i].Name = updated.Name
			items[i].Quantity = updated.Quantity
			items[i].Section = updated.Section
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(items[i])
			return
		}
	}
	http.Error(w, "item not found", http.StatusNotFound)
}

// DELETE /items/{id} - delete an item by ID
func deleteItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	for i, item := range items {
		if item.ID == id {
			items = append(items[:i], items[i+1:]...)
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}
	http.Error(w, "item not found", http.StatusNotFound)
}

// PATCH /items/{id}/toggle - toggle bought status by ID
func toggleItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	for i, item := range items {
		if item.ID == id {
			items[i].Bought = !item.Bought
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(items[i])
			return
		}
	}
	http.Error(w, "item not found", http.StatusNotFound)

}

func main() {
	r := mux.NewRouter()
	//endpoints
	r.HandleFunc("/list", createListHandler).Methods("POST")

	r.HandleFunc("/items", getItemsHandler).Methods("GET")
	r.HandleFunc("/items", addItemHandler).Methods("POST")
	r.HandleFunc("/items/{id}", getItemByIDHandler).Methods("GET")
	r.HandleFunc("/items/{id}", updateItemHandler).Methods("PUT")
	r.HandleFunc("/items/{id}", deleteItemHandler).Methods("DELETE")
	r.HandleFunc("/items/{id}/toggle", toggleItemHandler).Methods("PATCH")

	fmt.Println("Server running on: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
