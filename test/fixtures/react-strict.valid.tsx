import React, { useState, useCallback, useMemo } from 'react'


interface UserCardProps {
  id:       string
  name:     string
  email:    string
  isActive: boolean
  onSelect: (id: string) => void
}


const UserCard: React.FC<UserCardProps> = ({ id, name, email, isActive, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(id)
  }, [ id, onSelect ])

  const displayName = useMemo(() =>
    isActive ? name : `${name} (inactive)`, [ isActive, name ])

  return <article className="user-card">
    <header>
      <h3>{displayName}</h3>
    </header>

    <p>{email}</p>

    <button
      type="button"
      onClick={ handleClick }>
      Select
    </button>
  </article>
}


interface UserListProps {
  users:    UserCardProps[]
  onSelect: (id: string) => void
}


const UserListItem: React.FC<UserCardProps> = props =>
  <UserCard { ...props } />


const UserList: React.FC<UserListProps> = ({ users, onSelect }) => {
  const [ filter, setFilter ] = useState('')

  const filtered = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(filter.toLowerCase())), [ users, filter ])

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value)
  }, [])

  return <section className="user-list">
    <input
      type="text"
      placeholder="Filter users..."
      value={ filter }
      onChange={ handleFilterChange } />

    <ul>
      {filtered.map(user =>
        <UserListItem
          key={ user.id }
          { ...user }
          onSelect={ onSelect } />)}
    </ul>
  </section>
}


export default UserList
