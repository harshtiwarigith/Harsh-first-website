USE educational_platform;
INSERT INTO skills (name, category) VALUES
('Python & JavaScript','Programming'),('Public Speaking','Communication'),
('Logical Reasoning','Problem Solving'),('Computer Fundamentals','Technical');
INSERT INTO subjects (name, description) VALUES
('Computer Science','Core programming and computing concepts'),
('Mathematics','Aptitude and logical reasoning'),
('English','Grammar, writing and communication');
INSERT INTO questions (subject_id, skill_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty) VALUES
(1,1,'Which keyword declares a constant in JavaScript?','var','let','const','static','c','easy'),
(1,1,'What does len([1,2,3]) return in Python?','2','3','4','Error','b','easy'),
(1,4,'What does CPU stand for?','Central Processing Unit','Control Program Unit','Core Power Unit','Central Program Utility','a','easy'),
(1,4,'Which of these is a relational database?','MongoDB','Redis','MySQL','Neo4j','c','easy'),
(2,3,'What is 15% of 200?','20','25','30','35','c','easy'),
(2,3,'Next number: 2, 4, 8, 16, ?','24','32','30','20','b','medium'),
(3,2,'Choose the correct sentence.','She go to school.','She goes to school.','She going to school.','She gone to school.','b','easy'),
(3,2,'A synonym of "brief" is:','Long','Short','Heavy','Slow','b','easy');
INSERT INTO learning_activities (subject_id, skill_id, title, description, resource_url, points) VALUES
(1,1,'Complete a JavaScript basics tutorial','Variables, functions and loops','https://developer.mozilla.org/en-US/docs/Learn',20),
(1,1,'Solve 5 Python practice problems','Lists, strings and loops','https://www.python.org/about/gettingstarted/',20),
(1,4,'Read about how computers store data','Bits, bytes and memory','https://www.khanacademy.org/computing',15),
(2,3,'Practice 10 aptitude puzzles','Number series and percentages','https://www.khanacademy.org/math',15),
(3,2,'Record a 2-minute self-introduction','Practice speaking clearly','https://www.ted.com/topics/communication',25),
(3,2,'Write a 200-word essay','Focus on grammar and structure','https://www.grammarly.com/blog',15);
