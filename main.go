package main

import (
	"fmt"
	"log"
	"net/http"
)

// handler to create a list
func createListHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	fmt.Fprintln(w, "create list - not implemented yet")
}

// handler to add an item
func addItemHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	fmt.Fprintln(w, "add item - not implemented yet")
}

// handler to update an item
func updateItemHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	fmt.Fprintln(w, "update item - not implemented yet")
}

// handler to delete an item
func deleteItemHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	fmt.Fprintln(w, "delete item - not implemented yet")
}

// handler to toggle bought status (bool)
func toggleItemHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	fmt.Fprintln(w, "toggle item - not implemented yet")
}

// todo: function to get all items + endpoint for get

func main() {
	//endpoints
	http.HandleFunc("/list", createListHandler)
	http.HandleFunc("/items", addItemHandler)
	http.HandleFunc("/items/update", updateItemHandler)
	http.HandleFunc("/items/delete", deleteItemHandler)
	http.HandleFunc("/items/toggle", toggleItemHandler)

	fmt.Println("Server running on: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
