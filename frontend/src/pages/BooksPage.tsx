import { useState, useEffect } from "react";
import type { Book, User } from "../types";
import api from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function BooksPage() {
  // main page for listing, searching, adding, editing and deleting books
  // helper to truncate long strings for UI previews
  const truncateText = (s: string | undefined | null, n = 40) => {
    if (!s) return "";
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  };
  
  // Check if user is logged in
  const [user, setUser] = useState<User | null>(null);
  
  // Data & UI state
  const [books, setBooks] = useState<Book[]>([]); // list of books fetched from backend
  const [loading, setLoading] = useState(true); // whether books are currently loading
  const [searchQuery, setSearchQuery] = useState(""); // text in the search input
  const [sortBy, setSortBy] = useState<"title" | "year">("title"); // sort method
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    publishedYear: new Date().getFullYear(),
  });
  
  // Character limits
  const LIMITS = {
    title: 100,
    author: 50,
    description: 500,
  };
  
  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  
  // Toast/alert state
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "warning" | "" } | null>(null); // top-level alert
  // Form-level error (shows inside the Add/Edit dialog)
  const [formError, setFormError] = useState<string | null>(null);
  // Field-level validation errors displayed beneath each input
  const [formErrors, setFormErrors] = useState<{ title?: string; author?: string; description?: string; publishedYear?: string }>({});

  useEffect(() => {
    // Load books once when component mounts
    loadBooks();
    
    // Check if user is logged in
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get<Book[]>("/books");
      setBooks(response.data);
    } catch (error) {
      // Show error if fetch fails
      showAlert("Failed to load books", "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string, type: "success" | "error" | "warning" | "") => {
    // If the form dialog is open, show errors inside it instead of the top level alert
    if (type === "error" && isFormOpen) {
      setFormError(message);
      // Clear form error after a short delay
      setTimeout(() => setFormError(null), 5000);
      return;
    }

    // Show all alerts as inline alerts at the top of the page
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // Compute list filtered by search and sorted according to sortBy
  const filteredBooks = books
    .filter((book) => {
      const query = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return b.publishedYear - a.publishedYear;
    });

  const handleAdd = () => {
    // prepare form for creating a new book
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      description: "",
      publishedYear: new Date().getFullYear(),
    });
    setIsFormOpen(true);
  };

  const handleEdit = (book: Book) => {
    // Populate form with selected book for editing
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description || "",
      publishedYear: book.publishedYear,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Client side validation
    const errors: { title?: string; author?: string; description?: string; publishedYear?: string } = {};
    if (!formData.title || formData.title.trim() === "") {
      errors.title = "Title is required";
    } else if (formData.title.length > LIMITS.title) {
      errors.title = `Title must be at most ${LIMITS.title} characters`;
    }
    if (!formData.author || formData.author.trim() === "") {
      errors.author = "Author is required";
    } else if (formData.author.length > LIMITS.author) {
      errors.author = `Author must be at most ${LIMITS.author} characters`;
    }
    if (formData.description && formData.description.length > LIMITS.description) {
      errors.description = `Description must be at most ${LIMITS.description} characters`;
    }
    const year = Number(formData.publishedYear);
    if (!year || Number.isNaN(year)) {
      errors.publishedYear = "Published year is required";
    } else if (year < 1000 || year > 2500) {
      errors.publishedYear = `Published year must be between 1000 and 2500`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Also show a concise top level message
      setFormError(null);
      setAlert({ message: "Fix form errors before submitting", type: "error" });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    // Clear previous field errors
    setFormErrors({});

    try {
      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, formData);
        // Notify success for update
        showAlert("Book updated successfully", "success");
      } else {
        await api.post("/books", formData);
        // Notify success for create
        showAlert("Book added successfully", "success");
      }
      setIsFormOpen(false);
      loadBooks();
    } catch (error: any) {
      // If backend returns validation info, map it to fields (assume { field: message })
      if (error?.response?.data?.errors) {
        // Example ASP.NET style errors: { Title: ["..."], Author: ["..."] }
        const respErrors = error.response.data.errors;
        const mapped: typeof errors = {};
        for (const key of Object.keys(respErrors)) {
          const fieldKey = key.toLowerCase();
          const msg = Array.isArray(respErrors[key]) ? respErrors[key].join(" ") : String(respErrors[key]);
          if (fieldKey.includes("title")) mapped.title = msg;
          if (fieldKey.includes("author")) mapped.author = msg;
          if (fieldKey.includes("description")) mapped.description = msg;
          if (fieldKey.includes("year") || fieldKey.includes("published")) mapped.publishedYear = msg;
        }
        setFormErrors(mapped);
        // show concise top level error
        setAlert({ message: "Server validation failed", type: "error" });
        setTimeout(() => setAlert(null), 3000);
      } else {
        // Generic failure message
        showAlert("Operation failed", "error");
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      // Call API to delete and inform the user
      await api.delete(`/books/${deleteTarget.id}`);
      showAlert("Book deleted successfully", "warning");
      setDeleteTarget(null);
      loadBooks();
    } catch (error) {
      // Show delete failure
      showAlert("Failed to delete book", "error");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Books</h1>
            <p className="text-muted-foreground mt-1">
              {books.length} {books.length === 1 ? "book" : "books"} in your collection
            </p>
          </div>
          {user && <Button onClick={handleAdd}>+ Add Book</Button>}
        </div>

        {/* Alert */}
        {alert && (
          <Alert className="mb-6" variant={
            alert.type === "success" ? "success" : 
            alert.type === "error" ? "destructive" :
            alert.type === "warning" ? "warning" : 
            "default"
          }>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Toolbar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort">Sort by</Label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "title" | "year")}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="title">A–Z (Title)</option>
                  <option value="year">Newest First</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "No books found" : "No books yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Add your first book to get started"}
              </p>
              {!searchQuery && user && <Button onClick={handleAdd}>Add your first book</Button>}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 overflow-hidden" style={{maxWidth: '180px'}}>
                            <div className="text-sm font-medium truncate" title={book.title}>{book.title}</div>
                          </td>
                          <td className="px-6 py-4 overflow-hidden" style={{maxWidth: '120px'}}>
                            <div className="text-sm text-muted-foreground truncate" title={book.author}>{book.author}</div>
                          </td>
                          <td className="px-6 py-4 overflow-hidden" style={{maxWidth: '220px'}}>
                            <div className="text-sm text-muted-foreground truncate" title={book.description}>{book.description || "—"}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary">{book.publishedYear}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {user && (
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(book)}>
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteTarget(book)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredBooks.map((book) => (
                <Card key={book.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate">{book.title}</CardTitle>
                        <CardDescription>by {book.author}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {book.publishedYear}
                      </Badge>
                    </div>
                  </CardHeader>
                  {book.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {book.description}
                      </p>
                    </CardContent>
                  )}
                  {user && (
                    <CardContent className={book.description ? "pt-0" : ""}>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(book)} className="flex-1">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(book)}
                          className="flex-1 text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingBook ? "Edit Book" : "Add New Book"}</DialogTitle>
              <DialogDescription>
                {editingBook ? "Update the book details below." : "Fill in the details to add a new book."}
              </DialogDescription>
            </DialogHeader>
            {/* Form-level error message (appears inside the dialog) */}
            {formError && (
              <div className="mb-4">
                <Alert variant="destructive">
                  <AlertTitle>Error — {formError.length} characters</AlertTitle>
                  <AlertDescription>
                    Showing length only. Maximum allowed: {LIMITS.description} characters.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, LIMITS.title);
                    setFormData({ ...formData, title: v });
                    setFormErrors({ ...formErrors, title: undefined });
                  }}
                  required
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.title.length}/{LIMITS.title}
                </div>
                {formErrors.title && <p className="text-xs text-destructive mt-1">{formErrors.title}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, LIMITS.author);
                    setFormData({ ...formData, author: v });
                    setFormErrors({ ...formErrors, author: undefined });
                  }}
                  required
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.author.length}/{LIMITS.author}
                </div>
                {formErrors.author && <p className="text-xs text-destructive mt-1">{formErrors.author}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, LIMITS.description);
                    setFormData({ ...formData, description: v });
                    setFormErrors({ ...formErrors, description: undefined });
                  }}
                  rows={3}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/{LIMITS.description}
                </div>
                {formErrors.description && <p className="text-xs text-destructive mt-1">{formErrors.description}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Published Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.publishedYear}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setFormData({ ...formData, publishedYear: v });
                    setFormErrors({ ...formErrors, publishedYear: undefined });
                  }}
                  min={1000}
                  max={2500}
                  required
                />
                {formErrors.publishedYear && <p className="text-xs text-destructive mt-1">{formErrors.publishedYear}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingBook ? "Update" : "Add"} Book</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Book</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              <span className="font-medium" title={deleteTarget?.title}>
                {truncateText(deleteTarget?.title, 50)}
              </span>
              "? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
