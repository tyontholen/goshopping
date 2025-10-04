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

// handler for /items, post, get, put, delete
func itemsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		fmt.Fprintln(w, "add item - not implemented yet")
	case http.MethodGet:
		fmt.Fprintln(w, "list items - not implemented yet")
	case http.MethodPut:
		fmt.Fprintln(w, "update item - not implemented yet")
	case http.MethodDelete:
		fmt.Fprintln(w, "delete item - not implemented yet")
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

// handler to toggle bought status (bool)
func toggleItemHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	fmt.Fprintln(w, "toggle item - not implemented yet")
}

func main() {
	//endpoints
	http.HandleFunc("/list", createListHandler)
	http.HandleFunc("/items", itemsHandler)
	http.HandleFunc("/items/toggle", toggleItemHandler)

	fmt.Println("Server running on: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
