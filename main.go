package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

// todo: structs for list, item

// handler to create a list
func createListHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "create list - not implemented yet")
}

// handler to get all items of a list
func getItemsHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "list all items - not implemented yet")
}

// handler to add an item to a list
func addItemHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "add item - not implemented yet")
}

// handler to get one item by ID
func getItemByIDHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	fmt.Fprintf(w, "get item with id %s - not implemented yet\n", id)
}

// handler to update item
func updateItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	fmt.Fprintf(w, "update item %s by id - not implemented yet\n", id)
}

// handler to delete item
func deleteItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	fmt.Fprintf(w, "delete item %s - not implemented yet\n", id)
}

// handler to toggle bought status (bool)
func toggleItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	fmt.Fprintf(w, "update item %s by id - not implemented yet\n", id)
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
