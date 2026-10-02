// Mock Relational Database Architecture
const GLAMS_DB = {
    user: {
        id: "USR-001",
        firstName: "Rajendra",
        lastName: "Saha",
        initials: "RS"
    },
    courses: [
        { id: "c1", name: "C", icon: "⚙️" },
        { id: "c2", name: "C++", icon: "⚡" },
        { id: "c3", name: "Python", icon: "🐍" },
        { id: "c4", name: "DBMS", icon: "🗄️" },
        { id: "c5", name: "AI", icon: "🤖" },
        { id: "c6", name: "Big Data", icon: "📈" },
        { id: "c7", name: "Math", icon: "➗" }
    ],
    questions: {
        "c2": [ // C++ specific questions representing real-world logic
            {
                text: "What is the purpose of the 'break' statement in a C++ loop?",
                options: [
                    "To skip the current iteration",
                    "To immediately exit the loop entirely",
                    "To pause program execution",
                    "To return a value to OS"
                ],
                correctIndex: 1
            },
            {
                text: "Which concept allows multiple functions with the same name but different parameters?",
                options: ["Encapsulation", "Function Overloading", "Inheritance", "Polymorphism"],
                correctIndex: 1
            }
        ]
    }
};