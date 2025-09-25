import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const listSubjects = query({
  args: {},
  handler: async ctx => {
    const lessons = await ctx.db.query('lessons').collect();
    const set = new Set<string>();
    for (const l of lessons) if (l.subject) set.add(l.subject);
    return Array.from(set).sort();
  },
});

export const listLessons = query({
  args: { subject: v.optional(v.string()) },
  handler: async (ctx, { subject }) => {
    const results = await ctx.db.query('lessons').collect();
    return results
      .filter(l => (subject ? l.subject === subject : true))
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(l => ({
        _id: l._id,
        title: l.title,
        subject: l.subject,
        videoUrl: l.videoUrl,
        pdfUrl: l.pdfUrl,
      }));
  },
});

export const getLesson = query({
  args: { id: v.id('lessons') },
  handler: async (ctx, { id }) => {
    const l = await ctx.db.get(id);
    if (!l) return null;
    return l;
  },
});

export const createLesson = mutation({
  args: {
    moduleId: v.id('modules'),
    title: v.string(),
    order: v.number(),
    subject: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    transcript: v.optional(v.string()),
    attachments: v.optional(v.array(v.object({ name: v.string(), url: v.string() }))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Allow direct creation during seeding
      await ctx.db.insert('lessons', { ...args });
      return;
    }
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('Forbidden');
    await ctx.db.insert('lessons', { ...args });
  },
});

export const createCourse = mutation({
  args: {
    title: v.string(),
    track: v.string(),
    createdBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Allow creation during seeding (for admin users) or require auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Allow direct creation during seeding
      return await ctx.db.insert('courses', { ...args, createdAt: Math.floor(Date.now() / 1000) });
    }
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('Forbidden');
    return await ctx.db.insert('courses', { ...args, createdAt: Math.floor(Date.now() / 1000) });
  },
});

export const createModule = mutation({
  args: {
    courseId: v.id('courses'),
    title: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Allow direct creation during seeding
      return await ctx.db.insert('modules', args);
    }
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('Forbidden');
    return await ctx.db.insert('modules', args);
  },
});

export const markLessonViewed = mutation({
  args: { lessonId: v.id('lessons') },
  handler: async (ctx, { lessonId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    const lesson = await ctx.db.get(lessonId);
    const subject = (lesson as any)?.subject;
    const now = Math.floor(Date.now() / 1000);
    await ctx.db.insert('progressEvents', {
      userId: user._id,
      subject,
      kind: 'lesson_viewed',
      value: 1,
      createdAt: now,
    });
  },
});

// Get complete course structure with modules and lessons
export const getCoursesWithModules = query({
  args: { track: v.optional(v.string()) },
  handler: async (ctx, { track }) => {
    // Get courses filtered by track if provided
    const courses = await ctx.db
      .query('courses')
      .filter(q => track ? q.eq(q.field('track'), track) : true)
      .collect();

    // For each course, get its modules
    const coursesWithModules = await Promise.all(
      courses.map(async (course) => {
        const modules = await ctx.db
          .query('modules')
          .withIndex('byCourse', q => q.eq('courseId', course._id))
          .collect();

        // For each module, get its lessons
        const modulesWithLessons = await Promise.all(
          modules
            .sort((a, b) => a.order - b.order)
            .map(async (module) => {
              const lessons = await ctx.db
                .query('lessons')
                .withIndex('byModule', q => q.eq('moduleId', module._id))
                .collect();

              return {
                ...module,
                lessons: lessons
                  .sort((a, b) => a.order - b.order)
                  .map(lesson => ({
                    _id: lesson._id,
                    title: lesson.title,
                    order: lesson.order,
                    videoUrl: lesson.videoUrl,
                    pdfUrl: lesson.pdfUrl,
                    subject: lesson.subject,
                    transcript: lesson.transcript,
                    attachments: lesson.attachments,
                  }))
              };
            })
        );

        return {
          ...course,
          modules: modulesWithLessons
        };
      })
    );

    return coursesWithModules;
  },
});

// Get course by ID with full structure
export const getCourseStructure = query({
  args: { courseId: v.id('courses') },
  handler: async (ctx, { courseId }) => {
    const course = await ctx.db.get(courseId);
    if (!course) return null;

    // Get modules for this course
    const modules = await ctx.db
      .query('modules')
      .withIndex('byCourse', q => q.eq('courseId', courseId))
      .collect();

    // Get lessons for each module
    const modulesWithLessons = await Promise.all(
      modules
        .sort((a, b) => a.order - b.order)
        .map(async (module) => {
          const lessons = await ctx.db
            .query('lessons')
            .withIndex('byModule', q => q.eq('moduleId', module._id))
            .collect();

          // Get quiz count for each lesson
          const lessonsWithQuizzes = await Promise.all(
            lessons
              .sort((a, b) => a.order - b.order)
              .map(async (lesson) => {
                const quizCount = await ctx.db
                  .query('quizzes')
                  .withIndex('byLesson', q => q.eq('lessonId', lesson._id))
                  .collect()
                  .then(quizzes => quizzes.length);

                return {
                  ...lesson,
                  quizCount
                };
              })
          );

          return {
            ...module,
            lessons: lessonsWithQuizzes
          };
        })
    );

    return {
      ...course,
      modules: modulesWithLessons
    };
  },
});

// Get courses by track
export const getCoursesByTrack = query({
  args: { track: v.string() },
  handler: async (ctx, { track }) => {
    return await ctx.db
      .query('courses')
      .withIndex('byTrack', q => q.eq('track', track))
      .collect();
  },
});

// Get all available tracks
export const getAvailableTracks = query({
  args: {},
  handler: async ctx => {
    const courses = await ctx.db.query('courses').collect();
    const tracks = [...new Set(courses.map(c => c.track))];
    return tracks.sort();
  },
});
