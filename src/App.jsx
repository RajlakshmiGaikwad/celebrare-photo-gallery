import {
  useState,
  useCallback,
  useMemo,
  useReducer,
  useEffect
} from 'react'

import useFetchPhotos from './hooks/useFetchPhotos'

// Favourite photos manage करणारा reducer
function favouritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_FAVOURITE': {
      const photo = action.payload

      const alreadyFavourite = state.some(
        (item) => item.id === photo.id
      )

      if (alreadyFavourite) {
        return state.filter((item) => item.id !== photo.id)
      }

      return [...state, photo]
    }

    default:
      return state
  }
}

// localStorage मधून saved favourites घेण्यासाठी
function getInitialFavourites() {
  const savedFavourites = localStorage.getItem('favourites')

  return savedFavourites
    ? JSON.parse(savedFavourites)
    : []
}

function App() {
  const { photos, loading, error } = useFetchPhotos()

  const [searchTerm, setSearchTerm] = useState('')

  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    [],
    getInitialFavourites
  )

  // favourites बदलले की localStorage मध्ये save करतो
  useEffect(() => {
    localStorage.setItem(
      'favourites',
      JSON.stringify(favourites)
    )
  }, [favourites])

  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value)
  }, [])

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) =>
      photo.author
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  }, [photos, searchTerm])

  const toggleFavourite = (photo) => {
    dispatch({
      type: 'TOGGLE_FAVOURITE',
      payload: photo
    })
  }

 if (loading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>

      <p className="text-lg font-semibold">
        Loading photos...
      </p>
    </div>
  )
}

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-xl">
          Error: {error}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold text-center mb-8">
        Photo Gallery
      </h1>

      <div className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by author..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {filteredPhotos.map((photo) => {
          const isFavourite = favourites.some(
            (item) => item.id === photo.id
          )

          return (
            <div
              key={photo.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={photo.download_url}
                alt={photo.author}
                className="w-full h-48 object-cover"
              />

              <div className="p-4 flex items-center justify-between">
                <p className="font-semibold">
                  {photo.author}
                </p>

                <button
                  onClick={() => toggleFavourite(photo)}
                  className="text-2xl"
                  aria-label="Toggle favourite"
                >
                  {isFavourite ? '❤️' : '♡'}
                </button>
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}

export default App