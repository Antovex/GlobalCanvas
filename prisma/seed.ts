import { AttendanceStatus, Day, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomAttendanceStatus(): AttendanceStatus {
	const rand = Math.random();
	if (rand < 0.8) return "PRESENT";      // 80% present
	if (rand < 0.95) return "ABSENT";      // 15% absent
	return "COMPENSATION";                 // 5% compensation
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
				sex: i % 2 === 0 ? "FEMALE" : "MALE",
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
		const dayOptions: Day[] = [
			"MONDAY",
			"TUESDAY",
			"WEDNESDAY",
			"THURSDAY",
			"FRIDAY",
			"SATURDAY",
			"SUNDAY",
		];
		const day = dayOptions[(i - 1) % dayOptions.length];
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

	// Attendance - Generate realistic attendance data for past 2 weeks
	const today = new Date();
	const startDate = new Date(today);
	startDate.setDate(today.getDate() - 14); // Start 2 weeks ago

	for (let d = 0; d < 14; d++) {
		const date = new Date(startDate);
		date.setDate(startDate.getDate() + d);
		
		// Skip weekends for attendance
		if (date.getDay() === 0 || date.getDay() === 6) continue;
		
		// Create attendance for random selection of students
		const attendanceCount = randomInt(18, 30); // Random number of students attend each day
		const shuffledStudents = [...studentIds].sort(() => Math.random() - 0.5);
		
		for (let s = 0; s < attendanceCount; s++) {
			const studentRef = shuffledStudents[s];
			const lessonRef = lessons[s % lessons.length];
			
			await prisma.attendance.create({
				data: {
					date,
					status: getRandomAttendanceStatus(),
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
