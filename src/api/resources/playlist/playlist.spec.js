import { expect } from 'chai'
import createApiSpec from '~/apiSpecs'
import { runQuery, dropDb } from '../../../../test/helpers'
import { Playlist } from './playlist.model'
import { Song } from '../song/song.model'

createApiSpec(
  Playlist,
  'playlist',
  {title: 'study jams', favorite: true}
)

describe.only('Playlist', () => {
  let playlist
  beforeEach(async () => {
    await dropDb()
    playlist = await Playlist.create({ title: 'study jams', favorite: true })
  })

  afterEach(async () => {
    await dropDb()
  })

  it('should create new playlist', async () => {
    const input = {
      title: 'test title',
      favorite: true,
    }

    const result = await runQuery(`
      mutation newPlaylist($input: NewPlaylist!) {
        newPlaylist(input: $input) {
          title
          favorite
        }
      }
    `, { input })

    expect(result.errors).to.not.exist
    expect(result.data.newPlaylist).to.be.an('object')
    expect(result.data.newPlaylist.title).to.eql(input.title)
    expect(result.data.newPlaylist.favorite).to.eql(input.favorite)
  })

  it('should get single playlist', async () => {
    const result = await runQuery(`
      {
        Playlist(id: "${playlist.id}") {
          id
          title
          favorite
        }
      }
    `)

    expect(result.errors).to.not.exist
    expect(result.data.Playlist).to.be.an('object')
    expect(result.data.Playlist.id).to.eql(playlist.id)
    expect(result.data.Playlist.title).to.eql(playlist.title)
    expect(result.data.Playlist.favorite).to.eql(playlist.favorite)
  })

  it('should update playlist', async () => {
    const song = await Song.create({title: 'downtown jamming', url: 'http://music.mp3'})
    const input = {
      id: playlist.id,
      title: 'updated title',
      favorite: false,
      songs: [song.id],
    }

    const result = await runQuery(`
      mutation updatePlaylist($input: UpdatedPlaylist!) {
        updatePlaylist(input: $input) {
          id
          title
          favorite
          songs {
            id
          }
        }
      }
    `, { input })

    expect(result.errors).to.not.exist
    expect(result.data.updatePlaylist).to.be.an('object')
    expect(result.data.updatePlaylist.id).to.eql(input.id)
    expect(result.data.updatePlaylist.title).to.eql(input.title)
    expect(result.data.updatePlaylist.favorite).to.eql(input.favorite)
    expect(result.data.updatePlaylist.songs[0].id).to.eql(song.id)
  })
})
