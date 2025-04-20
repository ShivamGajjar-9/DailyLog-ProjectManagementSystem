import { faker } from "@faker-js/faker";

export const generateDummyWorkspaces = (count: number = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `ws-${i + 1}`,
    name: faker.company.name(),
    description: faker.company.catchPhrase(),
    createdAt: faker.date.past(),
    members: generateDummyMembers(Math.floor(Math.random() * 5) + 3),
    projects: generateDummyProjects(Math.floor(Math.random() * 5) + 2),
  }));
};

export const generateDummyProjects = (count: number = 3) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `proj-${i + 1}`,
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(['active', 'completed', 'on-hold']),
    progress: faker.number.int({ min: 0, max: 100 }),
    dueDate: faker.date.future(),
    tasks: generateDummyTasks(Math.floor(Math.random() * 10) + 5),
  }));
};

export const generateDummyTasks = (count: number = 10) => {
  const priorities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['todo', 'in-progress', 'completed', 'blocked'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i + 1}`,
    title: faker.hacker.phrase(),
    description: faker.lorem.paragraph(),
    priority: faker.helpers.arrayElement(priorities),
    status: faker.helpers.arrayElement(statuses),
    assignee: generateDummyMember(),
    dueDate: faker.date.future(),
    createdAt: faker.date.past(),
    tags: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      () => faker.hacker.adjective()
    ),
  }));
};

export const generateDummyMembers = (count: number = 5) => {
  return Array.from({ length: count }, () => generateDummyMember());
};

export const generateDummyMember = () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    id: faker.string.uuid(),
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }),
    avatar: faker.image.avatar(),
    role: faker.helpers.arrayElement([
      'Project Manager',
      'Developer',
      'Designer',
      'Product Owner',
      'QA Engineer',
    ]),
    joinedAt: faker.date.past(),
  };
};

export const generateTaskActivityData = (days: number = 30) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    return {
      date: date.toISOString().split('T')[0],
      completed: faker.number.int({ min: 0, max: 15 }),
      created: faker.number.int({ min: 1, max: 20 }),
    };
  });
};

export const generateProductivityData = (weeks: number = 12) => {
  return Array.from({ length: weeks }, (_, i) => {
    const weekNumber = i + 1;
    return {
      week: `Week ${weekNumber}`,
      tasksCompleted: faker.number.int({ min: 10, max: 50 }),
      avgCompletionTime: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
      efficiency: faker.number.float({ min: 60, max: 95, precision: 0.1 }),
    };
  });
}; 