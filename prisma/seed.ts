// import { Day, PrismaClient, UserSex } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//     // ADMIN
//     await prisma.admin.create({
//         data: {
//             id: "admin1",
//             username: "admin1",
//         },
//     });
//     await prisma.admin.create({
//         data: {
//             id: "admin2",
//             username: "admin2",
//         },
//     });

//     // GRADE
//     // for (let i = 1; i <= 6; i++) {
//     //     await prisma.grade.create({
//     //         data: {
//     //             level: i,
//     //         },
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
	console.log("Start seeding...");

	// Admins
	await prisma.admin.createMany({
		data: [
			{ id: "admin", username: "admin" },
			{ id: "admin2", username: "admin2" },
		],
		skipDuplicates: true,
	});

	// Subjects
	const subjectNames = [
		"Mathematics",
		"Science",
		"English",
		"History",
		"Geography",
		"Physics",
		"Chemistry",
		"Biology",
		"Computer Science",
		"Art",
	];

	const subjects = [] as { id: number; name: string }[];
	for (const name of subjectNames) {
		const s = await prisma.subject.upsert({
			where: { name },
			update: {},
			create: { name },
		});
		subjects.push({ id: s.id, name: s.name });
	}

	// Teachers
	const teacherIds: string[] = [];
	for (let i = 1; i <= 8; i++) {
		const id = `teacher${i}`;
		teacherIds.push(id);
		await prisma.teacher.upsert({
			where: { id },
			update: {},
			create: {
				id,
				username: `teacher${i}`,
				name: `Teacher ${i}`,
				surname: `Lastname${i}`,
				email: `teacher${i}@example.com`,
				phone: `+100000000${i}`,
				address: `Address ${i}`,
				img: null,
				bloodType: "O+",
				sex: "MALE",
				birthday: new Date(1985, 0, i),
				subjects: {
					connect: [{ id: subjects[(i - 1) % subjects.length].id }],
				},
			},
		});
	}

	// Classes
	const classes: { id: number; name: string }[] = [];
	for (let i = 1; i <= 6; i++) {
		const name = `Class ${i}`;
		const supervisorId = teacherIds[(i - 1) % teacherIds.length];
		const c = await prisma.class.upsert({
			where: { name },
			update: {},
			create: {
				name,
				capacity: 30 + i,
				supervisorId,
			},
		});
		classes.push({ id: c.id, name: c.name });
	}

	// Parents
	const parentIds: string[] = [];
	for (let i = 1; i <= 12; i++) {
		const id = `parent${i}`;
		parentIds.push(id);
		await prisma.parent.upsert({
			where: { id },
			update: {},
			create: {
				id,
				username: `parent${i}`,
				name: `Parent ${i}`,
				surname: `Surname${i}`,
				email: `parent${i}@example.com`,
				phone: `+20000000${i}`,
				address: `Parent Address ${i}`,
			},
		});
	}

	// Students
	const studentIds: string[] = [];
	for (let i = 1; i <= 36; i++) {
		const id = `student${i}`;
		studentIds.push(id);
		const classRef = classes[(i - 1) % classes.length];
		const parentRef = parentIds[(i - 1) % parentIds.length];
		await prisma.student.upsert({
			where: { id },
			update: {},
			create: {
				id,
				username: `student${i}`,
				name: `Student ${i}`,
				surname: `Surname${i}`,
				email: `student${i}@example.com`,
				phone: null,
				address: `Student Address ${i}`,
				img: null,
				bloodType: "A+",
				sex: i % 2 === 0 ? "FEMALE" : "MALE",
				parentId: parentRef,
				classId: classRef.id,
				birthday: new Date(2010, 0, (i % 28) + 1),
			},
		});
	}

	// Lessons
	const lessons: { id: number }[] = [];
	for (let i = 1; i <= 24; i++) {
		const subject = subjects[(i - 1) % subjects.length];
		const classRef = classes[(i - 1) % classes.length];
		const teacherId = teacherIds[(i - 1) % teacherIds.length];
		const dayOptions = [
			"MONDAY",
			"TUESDAY",
			"WEDNESDAY",
			"THURSDAY",
			"FRIDAY",
			"SATURDAY",
			"SUNDAY",
		];
		const day = dayOptions[(i - 1) % dayOptions.length] as any;
		const start = new Date();
		start.setHours(8 + ((i - 1) % 8), 0, 0, 0);
		const end = new Date(start);
		end.setHours(start.getHours() + 1);

		const l = await prisma.lesson.create({
			data: {
				name: `${subject.name} - Lesson ${i}`,
				day,
				startTime: start,
				endTime: end,
				subjectId: subject.id,
				classId: classRef.id,
				teacherId,
			},
		});
		lessons.push({ id: l.id });
	}

	// Exams & Assignments & Results
	for (let i = 1; i <= 6; i++) {
		const lessonRef = lessons[(i - 1) % lessons.length];
		const exam = await prisma.exam.create({
			data: {
				title: `Exam ${i}`,
				startTime: new Date(),
				endTime: new Date(Date.now() + 1000 * 60 * 60),
				lessonId: lessonRef.id,
			},
		});

		const assignment = await prisma.assignment.create({
			data: {
				title: `Assignment ${i}`,
				startDate: new Date(),
				dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
				lessonId: lessonRef.id,
			},
		});

		// create some results for students
		for (let s = 1; s <= 4; s++) {
			const studentRef = studentIds[(i + s - 2) % studentIds.length];
			await prisma.result.create({
				data: {
					score: randomInt(40, 100),
					examId: exam.id,
					studentId: studentRef,
				},
			});
			await prisma.result.create({
				data: {
					score: randomInt(40, 100),
					assignmentId: assignment.id,
					studentId: studentRef,
				},
			});
		}
	}

	// Attendance for the first week for first 12 students
	const today = new Date();
	const dayOfWeek = today.getDay();
	const monday = new Date(today);
	monday.setDate(today.getDate() - dayOfWeek + 1);

	for (let d = 0; d < 5; d++) {
		const date = new Date(monday);
		date.setDate(monday.getDate() + d);
		for (let s = 0; s < 12; s++) {
			const studentRef = studentIds[s];
			const lessonRef = lessons[s % lessons.length];
			await prisma.attendance.create({
				data: {
					date,
					present: Math.random() > 0.1,
					studentId: studentRef,
					lessonId: lessonRef.id,
				},
			});
		}
	}

	// Events
	for (let i = 1; i <= 4; i++) {
		await prisma.event.create({
			data: {
				title: `Event ${i}`,
				description: `Description for event ${i}`,
				startTime: new Date(),
				endTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
				classId: i <= classes.length ? classes[i - 1].id : null,
			},
		});
	}

	// Announcements
	for (let i = 1; i <= 4; i++) {
		await prisma.announcement.create({
			data: {
				title: `Announcement ${i}`,
				description: `Announcement text ${i}`,
				date: new Date(),
				classId: i <= classes.length ? classes[i - 1].id : null,
			},
		});
	}

	console.log("Seeding finished.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
//     // EXAM
//     for (let i = 1; i <= 10; i++) {
//         await prisma.exam.create({
//             data: {
//                 title: `Exam ${i}`,
//                 startTime: new Date(
//                     new Date().setHours(new Date().getHours() + 1)
//                 ),
//                 endTime: new Date(
//                     new Date().setHours(new Date().getHours() + 2)
//                 ),
//                 lessonId: (i % 30) + 1,
//             },
//         });
//     }

//     // ASSIGNMENT
//     for (let i = 1; i <= 10; i++) {
//         await prisma.assignment.create({
//             data: {
//                 title: `Assignment ${i}`,
//                 startDate: new Date(
//                     new Date().setHours(new Date().getHours() + 1)
//                 ),
//                 dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
//                 lessonId: (i % 30) + 1,
//             },
//         });
//     }

//     // RESULT
//     for (let i = 1; i <= 10; i++) {
//         await prisma.result.create({
//             data: {
//                 score: 90,
//                 studentId: `student${i}`,
//                 ...(i <= 5 ? { examId: i } : { assignmentId: i - 5 }),
//             },
//         });
//     }

//     // ATTENDANCE
//     // for (let i = 1; i <= 10; i++) {
//     //     await prisma.attendance.create({
//     //         data: {
//     //             date: new Date(),
//     //             present: true,
//     //             studentId: `student${i}`,
//     //             lessonId: (i % 30) + 1,
//     //         },
//     //     });
//     // }

//     // const today = new Date();
//     // const previousMonday = new Date(today);
//     // previousMonday.setDate(today.getDate() - today.getDay() - 6); // Get previous week's Monday

//     // for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
//     //     // Monday to Friday
//     //     const attendanceDate = new Date(previousMonday);
//     //     attendanceDate.setDate(previousMonday.getDate() + dayOffset);

//     //     for (let i = 1; i <= 10; i++) {
//     //         await prisma.attendance.create({
//     //             data: {
//     //                 date: attendanceDate,
//     //                 present: true,
//     //                 studentId: `student${i}`,
//     //                 lessonId: (i % 30) + 1,
//     //             },
//     //         });
//     //     }
//     // }

//     const today = new Date();
//     const previousMonday = new Date(today);
//     previousMonday.setDate(today.getDate() - today.getDay() - 6); // Get previous week's Monday

//     for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
//         // Monday to Sunday
//         const attendanceDate = new Date(previousMonday);
//         attendanceDate.setDate(previousMonday.getDate() + dayOffset);

//         // Random number of presents for the day (between 1 and 10)
//         const presentsCount = Math.floor(Math.random() * 10) + 1;

//         // Shuffle student IDs to pick random students
//         const studentIds = Array.from(
//             { length: 10 },
//             (_, i) => `student${i + 1}`
//         );
//         for (let i = 0; i < presentsCount; i++) {
//             await prisma.attendance.create({
//                 data: {
//                     date: attendanceDate,
//                     present: true,
//                     studentId: studentIds[i],
//                     lessonId: ((i + dayOffset) % 30) + 1,
//                 },
//             });
//         }
//     }

//     // EVENT
//     for (let i = 1; i <= 5; i++) {
//         await prisma.event.create({
//             data: {
//                 title: `Event ${i}`,
//                 description: `Description for Event ${i}`,
//                 startTime: new Date(
//                     new Date().setHours(new Date().getHours() + 1)
//                 ),
//                 endTime: new Date(
//                     new Date().setHours(new Date().getHours() + 2)
//                 ),
//                 classId: (i % 5) + 1,
//             },
//         });
//     }

//     // ANNOUNCEMENT
//     for (let i = 1; i <= 5; i++) {
//         await prisma.announcement.create({
//             data: {
//                 title: `Announcement ${i}`,
//                 description: `Description for Announcement ${i}`,
//                 date: new Date(),
//                 classId: (i % 5) + 1,
//             },
//         });
//     }

//     console.log("Seeding completed successfully.");
// }

// main()
//     .then(async () => {
//         await prisma.$disconnect();
//     })
//     .catch(async (e) => {
//         console.error(e);
//         await prisma.$disconnect();
//         process.exit(1);
//     });
