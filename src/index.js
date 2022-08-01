import React, { useMemo, useState, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import * as DB from '@ideadesignmedia/fe-db'
function ShopButton({children, onClick, className}) {
    return (<button className={`row gap marg-y prim-bg border dark-border very-small-radius light pad-very-small ${className}`} onClick={onClick}>{children}</button>)
}
function ShoppingItem({ children, remove }) {
    return (<div className="row wrap gap w100 pad-very-small jfs">
        <div className="column">
            {children}
        </div>
        <div className="column">
            <ShopButton onClick={remove}>REMOVE <div className="svg-container">X</div></ShopButton>
        </div>
    </div>)
}
function App() {
    const db = useMemo(() => new DB.db('encrypted-shopping-list', 'encrypteddatabase'), [])
    const Item = useMemo(() => {
        return DB.makeModel(db, 'item', data => {
            if (!data.name) throw new Error('missing name')
            return data
        }, {
            name: 'string',
        })
    }, [db])
    const [items, setItems] = useState([])
    const [adding, setAdding] = useState(false)
    const [removing, setRemoving] = useState(false)
    const [error, setError] = useState('')
    const initialForm = {
        name: ''
    }
    const [formData, setFormData] = useState(initialForm)
    useLayoutEffect(() => {
        new Item().findAll().then(items => {
            setItems(items)
        }).catch(e => console.error(e))
    }, [db, Item])
    const addItem = (item) => {
        setAdding(true)
        DB.construct(Item, item).then(item => item.save()).then(item => {
            setItems([...items, { ...item }])
            setFormData(initialForm)
            setAdding(false)
        }).catch(e => {
            console.log(e)
            setAdding(false)
            setError(e)
        })
    }
    const removeItem = _id => {
        setRemoving(true)
        new Item().delete(_id).then((deleted) => {
            setRemoving(false)
            if (deleted) {
                setItems([...items].filter(item => item._id !== _id))
            } else {
                setError('Item not found.')
            }
        }).catch(e => {
            console.log(e)
            setRemoving(false)
            setError(e)
        })

    }
    return (
        <div className="app padded-column pad-very-large jfs afs">
            <h1>Shopping List</h1>
            {error && <h5 className="warn marg-y-large">{JSON.stringify(error)}</h5>}
            <form className="shop-form afs jfs row wrap gap  marg-y-large" onSubmit={e => {
                e.preventDefault()
                e.stopPropagation()
                let form = e.target
                let warning = e => { setError(e); setTimeout(() => setError(''), 3000) }
                const name = form['name'].value
                if (!name) return warning('Missing item name')
                if (items.find(a => a.name === name)) return warning('Item already exists')
                addItem({ name })
            }}>
                
                    <input className="very-small-radius border strong pad" type="text" placeholder="Item Name" value={formData['name']} name="name" onChange={e => setFormData({ ...formData, name: e.target.value })} />
                
                <button>Add Item</button>
            </form>
            <div className="column jfs afs w100 marg-y-very-large">
                <h2>Your Items:</h2>
                {adding ? <h5>Adding to List</h5> : removing ? <h5>Removing from List</h5> : <div className="grid gap-large pad-y-large responsive-three-column w100">
                    {items.map((u, i) => (<ShoppingItem remove={() => removeItem(u._id)}>
                        <div className="column w100 jfs afs">
                            <h6>{u.name}</h6>
                            <span>{new Date(u._t)?.toLocaleString()}</span>
                        </div>
                    </ShoppingItem>))}
                </div>}
            </div>
        </div>)
}



const rootDiv = document.createElement('div')
rootDiv.id = 'root'
document.querySelector('body').appendChild(rootDiv)
createRoot(document.getElementById('root')).render(<App />)