import { Material } from '@repo/models/material'
import type { CoreSeed } from './core.seed'

/**
 * Owner: Team 04 — Class Materials.
 *
 * Deterministic on purpose: same data every run, so a test can assert an exact
 * count and a reviewer can reproduce what you saw.
 *
 * The Cloudinary URLs are fake. They are enough to build and test the list,
 * search and detail screens; only the actual upload flow needs a real account.
 */

const TOPICS: Record<string, string[]> = {
  CS201: ['Arrays and complexity', 'Linked lists', 'Trees and traversal', 'Hashing'],
  CS202: ['ER modelling', 'Normalization', 'SQL joins', 'Transactions and ACID'],
  CS203: ['Processes and threads', 'Scheduling', 'Deadlock', 'Virtual memory'],
  CS204: ['OSI and TCP/IP', 'Routing', 'TCP congestion control', 'DNS and HTTP'],
  CS205: ['HTML and CSS', 'JavaScript basics', 'React components', 'REST APIs'],
  MA201: ['Sets and relations', 'Combinatorics', 'Graph theory', 'Boolean algebra'],
}

export async function seedMaterials(core: CoreSeed) {
  const docs = core.subjects.flatMap((subject, subjectIndex) => {
    const topics = TOPICS[subject.code] ?? ['Week 1', 'Week 2', 'Week 3', 'Week 4']

    return topics.map((topic, i) => {
      // Attach each material to the matching week's session where one exists.
      const session = core.sessions.find(
        (s) => s.subjectId.equals(subject._id) && s.title.endsWith(`Week ${i + 1}`),
      )
      const isPdf = i % 2 === 1

      return {
        subjectId: subject._id,
        sessionId: session?._id ?? null,
        title: `${topic}`,
        description: `${subject.name} — week ${i + 1} class material.`,
        type: isPdf ? ('PDF' as const) : ('PPT' as const),
        cloudinary: {
          publicId: `seed/${subject.code.toLowerCase()}-w${i + 1}`,
          url: `https://res.cloudinary.com/demo/raw/upload/seed/${subject.code.toLowerCase()}-w${i + 1}.${isPdf ? 'pdf' : 'pptx'}`,
          bytes: 400_000 + subjectIndex * 25_000 + i * 60_000,
          format: isPdf ? 'pdf' : 'pptx',
        },
        externalUrl: null,
        uploadedBy: subject.facultyId ?? core.admin._id,
      }
    })
  })

  return Material.insertMany(docs)
}
