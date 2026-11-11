import { useEffect, useState } from 'react'
import './App.css'

function request(url, options = {}, parseJson = true) {
  return fetch(url, options).then(res => {
    if (!res.ok) throw new Error('request fail: ' + res.status)
    return parseJson ? res.json() : undefined
  })
}

function App() {
  const [books, setBooks] = useState([])
  const [mode, setMode] = useState({type: "view"})
  const [updateBook, setUpdateBook] = useState({title: "", author: "", description: "", price: ""})

  useEffect(() => {
    loadBooks()
  }, [])

  const resetMode = () => {
    setMode({ type: 'view' })
    setUpdateBook({title: "", author: "", description: "", price: ""})
  }

  const loadBooks = () => {
    request("/api/books")
      .then(data => {
        setBooks(data)
        resetMode()
      })
      .catch(err => console.error(err))
  }

  const startAdd = () => {
    setUpdateBook({title: "", author: "", description: "", price: ""})
    setMode({type: 'add'})
  }

  const validateParams = () => {
    if (!updateBook.title.trim() || !updateBook.author.trim()) {
      alert('title and author are required')
      return false
    }
    if (updateBook.price === '' || Number.isNaN(Number(updateBook.price))) {
      alert('price is required')
      return false
    }
    return true
  }
  const saveNew = () => {
    if (!validateParams()) return
    request('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updateBook.title,
        author: updateBook.author,
        description: updateBook.description ?? '',
        price: Number(updateBook.price)
      })
    }).then(data => {
        loadBooks()
      })
      .catch(err => console.error('save error', err))
  }

  const startEdit = (book) => {
    setUpdateBook({ title: book.title, author: book.author, description: book.description ?? '', price: book.price })
    setMode({ type: 'edit', id: book.id })
  }

  const saveUpdate = (id) => {
    if (!validateParams()) return
    request("/api/books/"+id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updateBook.title,
        author: updateBook.author,
        description: updateBook.description ?? '',
        price: Number(updateBook.price)
      })
    }).then(data => {
        loadBooks()
      })
      .catch(err => console.error('update error', err))
  }

  const deleteBook =  (id) => {
    request("/api/books/"+id, {method: 'DELETE'}, false)
      .then(() => { loadBooks() })
      .catch(err => console.error('delete error', err))
  }

  const searchBooks = (e) => {
    e.preventDefault()
    resetMode()
    const title = e.target.title.value.trim()
    const url = title ? `/api/books?title=${encodeURIComponent(title)}` : '/api/books'
    request(url)
      .then(data => setBooks(data))
      .catch(err => console.error(err))
  }

  return (
    <>
      <h1>Book Manage</h1>
      <div>
        <button onClick={startAdd}>Add</button>
        <button onClick={resetMode}>Cancel</button>
      </div>
      <form onSubmit={searchBooks}>
        <p>
          <label htmlFor="title">Title: </label>
          <input id="title" name="title" />
          <button type='submit'>Query</button>
        </p>
      </form>
      <table border={1}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Author</th>
            <th>Desc</th>
            <th>Price</th>
            <th>Command</th>
          </tr>
        </thead>
        <tbody>
          {
            books.map(book => (
              mode.type === 'edit' && mode.id === book.id ? (
                <tr key={book.id}>
                  <td>{book.id}</td>
                  <td><input value={updateBook.title} onChange={e => setUpdateBook({...updateBook, title:e.target.value})} /></td>
                  <td><input value={updateBook.author} onChange={e => setUpdateBook({...updateBook, author:e.target.value})} /></td>
                  <td><input value={updateBook.description} onChange={e => setUpdateBook({...updateBook, description:e.target.value})} /></td>
                  <td><input value={updateBook.price} onChange={e => setUpdateBook({...updateBook, price:e.target.value})} type='number'/></td>
                  <td>
                    <button onClick={() =>saveUpdate(book.id)}>save</button>
                  </td>
                </tr>
              ) : (
                <tr key={book.id}>
                  <td>{book.id}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.description}</td>
                  <td>{book.price}</td>
                  <td>
                    <div>
                      <button onClick={() => startEdit(book)}>update</button>
                      <button onClick={() => {if(confirm("Are you sure to delete?")) { deleteBook(book.id) }}}>delete</button>
                    </div>
                  </td>
                </tr>
              )
            ))
          }
          {
            mode.type === 'add' && 
            <tr>
              <td>-</td>
              <td><input value={updateBook.title} onChange={e => setUpdateBook({...updateBook, title:e.target.value})} /></td>
              <td><input value={updateBook.author} onChange={e => setUpdateBook({...updateBook, author:e.target.value})} /></td>
              <td><input value={updateBook.description} onChange={e => setUpdateBook({...updateBook, description:e.target.value})} /></td>
              <td><input value={updateBook.price} onChange={e => setUpdateBook({...updateBook, price:e.target.value}) } type="number" /></td>
              <td><button onClick={saveNew}>save</button></td>
            </tr>
          }
        </tbody>
      </table>
    </>
  )
}

export default App
