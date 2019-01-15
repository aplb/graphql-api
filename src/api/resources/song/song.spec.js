import { expect } from 'chai'
import merge from 'lodash.merge'
import createApiSpec from '~/apiSpecs'
import { runQuery, dropDb } from '../../../../test/helpers'
import { Song } from './song.model'

createApiSpec(
  Song,
  'song',
  {title: 'downtown jamming', url: 'http://music.mp3'}
)

describe.only('Song', () => {
  let song
  beforeEach(async () => {
    await dropDb()
    song = await Song.create({title: 'downtown jamming', url: 'http://music.mp3'})
  })

  afterEach(async () => {
    await dropDb()
  })

  it('should create new song', async () => {
    const input = {
      title: 'test title',
      url: 'https://example.com',
    }

    const result = await runQuery(`
      mutation createSong($input: NewSong!) {
        newSong(input: $input) {
          title
          url
        }
      }
    `, { input })

    expect(result.errors).to.not.exist
    expect(result.data.newSong).to.be.an('object')
    expect(result.data.newSong.title).to.eql(input.title)
    expect(result.data.newSong.url).to.eql(input.url)
  })

  it('should get all songs', async () => {
    const result = await runQuery(`
      {
        allSongs {
          title
          url
        }
      }
    `)

    expect(result.errors).to.not.exist
    expect(result.data.allSongs).to.be.an('array')
    expect(result.data.allSongs[0].title).to.eql(song.title)
    expect(result.data.allSongs[0].url).to.eql(song.url)
  })

  it('should update a song', async () => {
    const input = {
      title: 'test title',
      url: 'https://example.com',
    }

    const allSongs = await runQuery(`
      {
        allSongs {
          id
        }
      }
    `)
    const targetSong = allSongs.data.allSongs[0]

    const result = await runQuery(`
      mutation updateSong($input: UpdatedSong!) {
        updateSong(input: $input) {
          id
          title
          url
        }
      }
    `, { input: merge(input, { id: targetSong.id }) })

    expect(result.errors).to.not.exist
    expect(result.data.updateSong).to.be.an('object')
    expect(result.data.updateSong.id).to.eql(targetSong.id)
    expect(result.data.updateSong.title).to.eql(input.title)
    expect(result.data.updateSong.url).to.eql(input.url)
  })
})
