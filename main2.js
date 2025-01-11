let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");

function speak(text) {
    // Function to select the most appropriate female voice
    function selectVoice(voices) {
        console.log(voices); // Log the voices to debug

        return voices.find(voice => voice.name.includes("Google UK English Female") && voice.lang === "en-GB") ||
               voices.find(voice => voice.name.includes("Google US English") && voice.lang.startsWith("en")) ||
               voices.find(voice => voice.lang.startsWith("en") && voice.gender === "female") ||
               voices.find(voice => voice.lang.startsWith("en"));
    }

    // Function to initiate speech synthesis
    function startSpeaking() {
        let voices = window.speechSynthesis.getVoices();
        let selectedVoice = selectVoice(voices);

        if (!selectedVoice) {
            console.log("No suitable voice found!"); // Debugging message
            return;
        }

        let text_speak = new SpeechSynthesisUtterance(text);
        text_speak.rate = 0.9;
        text_speak.pitch = 1.4;
        text_speak.volume = 1;
        text_speak.voice = selectedVoice;

        window.speechSynthesis.speak(text_speak);
    }

    // Check if voices are already loaded
    if (window.speechSynthesis.getVoices().length > 0) {
        startSpeaking();
    } else {
        // Wait for voices to load if not already loaded
        window.speechSynthesis.onvoiceschanged = () => {
            console.log("Voices loaded successfully."); // Debugging message
            startSpeaking();
        };
    }
}


function wishMe() {
    let day = new Date();
    let hour = day.getHours();
    if (hour >= 0 && hour < 12) {
        speak("Good morning sir! How can I help you?");
    } else if (hour >= 12 && hour < 16) {  // Changed to 16 for correct afternoon range
        speak("Good afternoon sir! How can I help you?");
    } else {
        speak("Good evening sir! How can I help you?");
    }
}

// Trigger wishMe() function on page load
window.onload = function() {
    wishMe();  // Call wishMe when the page loads
};


let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();
recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());
};

btn.addEventListener("click", () => {
    recognition.start();
    btn.style.display = "none";
    voice.style.display = "block";
});

function openDesktopApp(url, appName) {
    let newWindow = window.open(url);
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        speak(`It seems like ${appName} is not installed on your desktop.`);
    } else {
        speak(`Sure sir, Opening ${appName}`);
    }
}

function openFileOrFolder(path) {
    try {
        const fileUrl = `file:///${path}`;
        let newWindow = window.open(fileUrl);
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            speak(`It seems like the file or folder at ${path} cannot be opened.`);
        } else {
            speak(`Sure sir, Opening the file/folder at ${path}`);
        }
    } catch (e) {
        speak(`An error occurred while trying to open the file or folder.`);
    }
}

let reminderTask = "";
let reminderTime = "";

function setReminder() {
    speak("Sure, what would you like to be reminded about?");
    
    // Listen for task
    recognition.onresult = (event) => {
        let currentIndex = event.resultIndex;
        reminderTask = event.results[currentIndex][0].transcript;
        content.innerText = reminderTask;
        speak(`Got it! I'll remind you about: ${reminderTask}. When would you like to be reminded?`);

        // Ask for time (e.g., after 5 minutes, or at a specific time)
        recognition.onresult = (event) => {
            currentIndex = event.resultIndex;
            reminderTime = event.results[currentIndex][0].transcript;
            content.innerText = reminderTime;

            // Here, you can parse the time and calculate the reminder time
            // Let's assume the time is in minutes (you can enhance this logic for more formats)
            let minutes = parseInt(reminderTime.split(" ")[0]);

            if (!isNaN(minutes)) {
                let reminderDate = new Date();
                reminderDate.setMinutes(reminderDate.getMinutes() + minutes);

                let reminderMessage = `Reminder: ${reminderTask}. Time: ${reminderDate.toLocaleTimeString()}`;
                setTimeout(() => {
                    speak(`Reminder: ${reminderTask} at ${reminderDate.toLocaleTimeString()}`);
                }, minutes * 60 * 1000); // Set reminder time (in milliseconds)

                speak(`Alright, I will remind you about '${reminderTask}' in ${minutes} minutes.`);
            } else {
                speak("Sorry, I couldn't understand the time. Could you specify the reminder time in minutes?");
            }
        };
    };
}


function confirmReminder(task, time) {
    speak(`You have set a reminder: '${task}' at ${time}. Is this correct?`);
    recognition.onresult = (event) => {
        let currentIndex = event.resultIndex;
        let confirmation = event.results[currentIndex][0].transcript.toLowerCase();
        if (confirmation.includes("yes")) {
            speak(`Reminder confirmed! I will remind you about '${task}' at ${time}.`);
        } else if (confirmation.includes("no")) {
            speak("Let's set the reminder again.");
            setReminder(); // Restart the reminder process
        } else {
            speak("Sorry, I didn't understand. Please say 'yes' to confirm or 'no' to change the reminder.");
        }
    };
}

function setReminder() {
    speak("Sure, what would you like to be reminded about?");
    
    // Listen for task
    recognition.onresult = (event) => {
        let currentIndex = event.resultIndex;
        reminderTask = event.results[currentIndex][0].transcript;
        content.innerText = reminderTask;
        speak(`Got it! I'll remind you about: ${reminderTask}. When would you like to be reminded?`);

        // Ask for time (e.g., at 5 PM)
        recognition.onresult = (event) => {
            currentIndex = event.resultIndex;
            reminderTime = event.results[currentIndex][0].transcript;
            content.innerText = reminderTime;

            // Check if reminderTime includes a specific hour (e.g., "5 PM")
            const timeRegex = /\d{1,2}(:\d{2})?\s?(AM|PM|am|pm)/;
            let timeMatch = reminderTime.match(timeRegex);
            if (timeMatch) {
                let hours = parseInt(timeMatch[0].split(":")[0]);
                if (timeMatch[0].includes("PM")) {
                    hours += 12;  // Convert PM time to 24-hour format
                }

                let reminderDate = new Date();
                reminderDate.setHours(hours);
                reminderDate.setMinutes(0); // Set minutes to 0 for full hour
                reminderDate.setSeconds(0); // Reset seconds

                let timeDiff = reminderDate - new Date(); // Calculate time difference
                if (timeDiff > 0) {
                    setTimeout(() => {
                        speak(`Reminder: ${reminderTask} at ${reminderDate.toLocaleTimeString()}`);
                    }, timeDiff);
                    speak(`Alright, I will remind you about '${reminderTask}' at ${reminderDate.toLocaleTimeString()}`);
                } else {
                    speak("Sorry, the time you provided is in the past. Please specify a future time.");
                }
            } else {
                speak("Sorry, I couldn't understand the time. Could you specify the time in a format like '5 PM'?");
            }
        };
    };
}

function setReminder() {
    speak("Sure, what would you like to be reminded about?");
    
    // Listen for task
    recognition.onresult = (event) => {
        let currentIndex = event.resultIndex;
        reminderTask = event.results[currentIndex][0].transcript;
        content.innerText = reminderTask;
        speak(`Got it! I'll remind you about: ${reminderTask}. When would you like to be reminded?`);

        // Ask for date (e.g., January 15th)
        recognition.onresult = (event) => {
            currentIndex = event.resultIndex;
            reminderTime = event.results[currentIndex][0].transcript;
            content.innerText = reminderTime;

            // Check if reminderTime includes a specific date (e.g., "January 15th")
            const dateRegex = /(\w+\s\d{1,2})(th|st|nd|rd)?/;
            let dateMatch = reminderTime.match(dateRegex);
            if (dateMatch) {
                let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                let [month, day] = dateMatch[1].split(" ");
                let reminderDate = new Date();
                reminderDate.setMonth(monthNames.indexOf(month));
                reminderDate.setDate(parseInt(day));
                reminderDate.setHours(9); // Set a default time (e.g., 9 AM) for the reminder

                let timeDiff = reminderDate - new Date(); // Calculate time difference
                if (timeDiff > 0) {
                    setTimeout(() => {
                        speak(`Reminder: ${reminderTask} on ${reminderDate.toLocaleDateString()}`);
                    }, timeDiff);
                    speak(`Alright, I will remind you about '${reminderTask}' on ${reminderDate.toLocaleDateString()}`);
                } else {
                    speak("Sorry, the date you provided is in the past. Please specify a future date.");
                }
            } else {
                speak("Sorry, I couldn't understand the date. Could you specify the date in a format like 'January 15th'?");
            }
        };
    };
}
let reminderTimeout;

function setReminder() {
    speak("Sure, what would you like to be reminded about?");
    
    // Listen for task
    recognition.onresult = (event) => {
        let currentIndex = event.resultIndex;
        reminderTask = event.results[currentIndex][0].transcript;
        content.innerText = reminderTask;
        speak(`Got it! I'll remind you about: ${reminderTask}. When would you like to be reminded?`);

        // Ask for time
        recognition.onresult = (event) => {
            currentIndex = event.resultIndex;
            reminderTime = event.results[currentIndex][0].transcript;
            content.innerText = reminderTime;

            // Parse reminder time and set timeout
            let minutes = parseInt(reminderTime.split(" ")[0]);
            if (!isNaN(minutes)) {
                let reminderDate = new Date();
                reminderDate.setMinutes(reminderDate.getMinutes() + minutes);

                reminderTimeout = setTimeout(() => {
                    speak(`Reminder: ${reminderTask} at ${reminderDate.toLocaleTimeString()}`);
                }, minutes * 60 * 1000);

                speak(`Alright, I will remind you about '${reminderTask}' in ${minutes} minutes.`);
            } else {
                speak("Sorry, I couldn't understand the time. Could you specify the reminder time in minutes?");
            }
        };
    };
}


let reminders = [];

function addReminder(task, time) {
    reminders.push({ task, time });
    speak(`Reminder '${task}' added for ${time}`);
}

function setReminder() {
    speak("Sure, what would you like to be reminded about?");
    
    // Listen for task
    recognition.onresult = (event) => {
        let currentIndex = event.resultIndex;
        reminderTask = event.results[currentIndex][0].transcript;
        content.innerText = reminderTask;
        speak(`Got it! I'll remind you about: ${reminderTask}. When would you like to be reminded?`);

        // Ask for time
        recognition.onresult = (event) => {
            currentIndex = event.resultIndex;
            reminderTime = event.results[currentIndex][0].transcript;
            content.innerText = reminderTime;

            // Add to reminders array
            addReminder(reminderTask, reminderTime);
        };
    };
}


function takeCommand(message) {
    btn.style.display = "flex";
    voice.style.display = "none";
    
    // Greetings
  

    // Self Introduction
     if (message.includes("who are you") || message.includes("what is your name") || message.includes("what's your name") || message.includes("tell me about yourself") || message.includes("hu r u")) {
        speak("I am Techie, Your Virtual Assistant. I am here to assist you in your daily tasks, created by Maaanam Sujra at Tecrix in the supervision of Mr. Hamzaa.");
    }

    // Asking how it is
    else if (message.includes("how are you") || message.includes("how are you doing") || message.includes("how are you feeling") || message.includes("how are you doing today") || message.includes("how are you feeling today") || message.includes("how r u")) {
        speak("I am fine, Thank you for asking. How can I assist you?");
    }

    // Commands to open websites
    else if (message.includes("open youtube") || message.includes("techie open youtube") || message.includes("hello techie open youtube") || message.includes("hey techie open youtube") || message.includes("hi techie open youtube")) {
        speak("Sure sir, Opening Youtube");
        window.open("https://www.youtube.com");
    }
    else if (message.includes("open my github account")) {
        speak("Sure sir, Opening your Github account");
        window.open("https://github.com/AM-gitco");
    }
    else if (message.includes("open facebook") || message.includes("hello techie open facebook") || message.includes("hey techie open facebook") || message.includes("hi techie open facebook")) {
        openDesktopApp("https://www.facebook.com", "Facebook");
    }
    else if (message.includes("open instagram") || message.includes("hello techie open instagram") || message.includes("hey techie open instagram") || message.includes("hi techie open instagram")) {
        openDesktopApp("https://www.instagram.com", "Instagram");
    }
    else if (message.includes("open tiktok") || message.includes("hello techie open tiktok") || message.includes("hey techie open tiktok") || message.includes("hi techie open tiktok")) {
        openDesktopApp("https://www.tiktok.com", "TikTok");
    }
    else if (message.includes("open google") || message.includes("hello techie open google") || message.includes("hey techie open google") || message.includes("hi techie open google")) {
        openDesktopApp("https://www.google.com", "Google");
    }
    else if (message.includes("open linkedin") || message.includes("hello techie open linkedin") || message.includes("hey techie open linkedin") || message.includes("hi techie open linkedin")) {
        openDesktopApp("https://www.linkedin.com", "LinkedIn");
    }
    else if (message.includes("open calculator") || message.includes("hello techie open calculator") || message.includes("hey techie open calculator") || message.includes("hi techie open calculator")) {
        openDesktopApp("calculator://", "Calculator");
    }

    // Desktop apps
    else if (message.includes("open whatsapp") || message.includes("hello techie open whatsapp") || message.includes("hey techie open whatsapp") || message.includes("hi techie open whatsapp")) {
        openDesktopApp("whatsapp://", "WhatsApp");
    }
    else if (message.includes("open beta whatsapp app") || message.includes("hello techie open whatsapp beta") || message.includes("hey techie open whatsapp beta") || message.includes("hi techie open whatsapp beta")) {
        openDesktopApp("whatsapp-beta://", "WhatsApp Beta");
    }
    else if (message.includes("open snapchat") || message.includes("hello techie open snapchat") || message.includes("hey techie open snapchat") || message.includes("hi techie open snapchat")) {
        openDesktopApp("snapchat://", "Snapchat");
    }
    else if (message.includes("open github desktop") || message.includes("hello techie open github desktop") || message.includes("hey techie open github desktop") || message.includes("hi techie open github desktop")) {
        openDesktopApp("github-desktop://", "GitHub Desktop");
    }
    else if (message.includes("open vs code") || message.includes("hello techie open vs code") || message.includes("hey techie open vs code") || message.includes("hi techie open vs code")) {
        openDesktopApp("vscode://", "Visual Studio Code");
    }
    else if (message.includes("open random app") || message.includes("hello techie open random app") || message.includes("hey techie open random app") || message.includes("hi techie open random app")) {
        // List of apps to choose from
        const apps = [
            { url: "whatsapp://", name: "WhatsApp" },
            { url: "snapchat://", name: "Snapchat" },
            { url: "github-desktop://", name: "GitHub Desktop" },
            { url: "vscode://", name: "Visual Studio Code" }
        ];
        
        // Pick a random app from the list
        const randomApp = apps[Math.floor(Math.random() * apps.length)];
        openDesktopApp(randomApp.url, randomApp.name);
    }
    else if (message.includes("open any app") || message.includes("hello techie open any app") || message.includes("hey techie open any app") || message.includes("hi techie open any app")) {
        // Ask for any app name
        let appName = message.replace("open any app", "").trim() || "desired app";
        let appUrl = `${appName.toLowerCase()}://`;
        openDesktopApp(appUrl, appName);
    }
    else if (message.includes("open file") || message.includes("open folder") || message.includes("hello techie open file") || message.includes("hello techie open folder")) {
        let path = message.replace(/open file|open folder|hello techie /gi, "").trim();
        if (path) {
            openFileOrFolder(path);
        } else {
            speak("Please specify the file or folder path.");
        }
    }
    // Time
    else if (message.includes("time")) {
        let time = new Date().toLocaleString(undefined, {hour: 'numeric', minute: 'numeric', hour12: true});
        speak(`Now the time is ${time}`);
    }

    // Date
    else if (message.includes("date")) {
        let date = new Date().toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'});
        speak(`Today's date is ${date}`);
    }
    // Weather Command (Optional)
    else if (message.includes("weather")) {
        // Extract the location from the message or set a default location
        let location = message.split("weather in")[1]?.trim() || "London";
    
        fetch(`http://api.weatherapi.com/v1/current.json?key=91767e25377a49a8b27191801251001&q=${location}&aqi=no`)
        .then(response => response.json())
        .then(data => {
            let weather = data.current.condition.text;
            let temp = data.current.temp_c;
            speak(`The current weather in ${location} is ${weather} with a temperature of ${temp} °C.`);
        })
        .catch(error => speak("Sorry, I couldn't fetch the weather data."));
    }
    else if (message.includes("tell me a joke")) {
        fetch("https://v2.jokeapi.dev/joke/Any?type=single&amount=1")
        .then(response => response.json())
        .then(data => {
            let joke = data.joke;
            speak(joke);
        })
        .catch(error => speak("Sorry, I couldn't fetch a joke right now."));
    }
        
else if (message.includes("cancel reminder")) {
    if (reminderTimeout) {
        clearTimeout(reminderTimeout);
        speak("Your reminder has been cancelled.");
    } else {
        speak("You don't have any active reminders.");
    }
}
// Reminder Command (Optional)
// else if (message.includes("set reminder")) {
//     speak("Sure, what would you like to be reminded about?");
//     // You can add more logic here to capture the reminder time and task
// }
else if (message.includes("set reminder")) {
    setReminder();
}
else if (message.includes("tecrix") ){
    speak("Tecrix is a cutting-edge software house specializing in advanced IT courses and digital services. They empower individuals and businesses with expertise in Generative AI, SEO, WordPress development, video editing, and more.At Tecrix, They blend technology with creativity to shape the future, offering innovative solutions and skill-building for tomorrow’s challenges.");
}
else if (message.includes("maanam") ){
    speak("Maaanam Sujra is a digital marketing professional with a passion for creating engaging and effective digital experiences. She is currently working as a Digital Marketing Specialist at Tecrix, where she helps businesses build their online presence and grow their brand. She holds a Bachelor of Science degree in Marketing from the University of California, Los Angeles.");
}
else if (message.includes("about") ){
    speak("I am Techie, Your Virtual Assistant. I am here to assist you in your daily tasks, created by Maaanam Sujra at Tecrix in the supervision of Mr. Hamzaa.");
}
else if (message.includes("help") ){
    speak("I can assist you with various tasks such as opening websites, desktop applications, searching on the internet, setting reminders, and more. Just say the command and I will do my best to assist you.");
}
else if (message.includes("tell about Sir Hamzaa") || message.includes("tell about Mr. Hamzaa") || message.includes("tell about Mr. Hamzaa Sir") || message.includes("tell about Mr. Hamzaa Sir Hamzaa") || message.includes("tell about Mr. Hamzaa Sir Hamzaa") || message.includes("tell about Mr. Hamzaa Sir Hamzaa") || message.includes("tell about Mr. Hamzaa Sir Hamzaa") ){
    speak("Mr. Hamza, the Senior Marketer at TEcrix Academy in Kotmomin, is an expert in digital marketing with a deep understanding of AI technologies. He is known for his innovative teaching approach, emphasizing real-world applications of AI in marketing. His ability to simplify complex concepts and his dedication to mentoring students make him a respected figure at the academy, helping students excel in AI-driven marketing.");
}
else if (message.includes("thank you") || message.includes("thank you sir") || message.includes("thank you maanam") || message.includes("thank you tecrix") || message.includes("thank you for your help") || message.includes("thank you for your assistance") || message.includes("thank you for your assistance sir") || message.includes("thank you for your assistance maanam") || message.includes("thank you for your assistance tecrix") || message.includes("thank you so much") || message.includes("thank you so much sir") || message.includes("thank you so much maanam") || message.includes("thank you so much tecrix") || message.includes("thank you very much") || message.includes("thank you very much sir") || message.includes("thank you very much maanam") || message.includes("thank you very much tecrix") || message.includes("thank you so much for your help") || message.includes("thank you so much for your assistance") || message.includes("thank you so much for your assistance sir") || message.includes("thank you so much for your assistance maanam") || message.includes("thank you so much for your assistance tecrix") || message.includes("thank you so much for your assistance sir") || message.includes("thank you so much for your assistance maanam") || message.includes("thank you so much for your assistance tecrix") || message.includes("thank you so much for your assistance sir") || message.includes("thank you so much for your assistance maanam") || message.includes("thank you so much for your assistance tecrix") || message.includes("thank you so much for your assistance sir") || message.includes("thank you so much for your assistance maanam") || message.includes("thank you so much for your assistance tecrix") || message.includes("thank you so much for your assistance sir") || message.includes("thank you so much for your assistance maanam") || message.includes("thank you so much for your assistance tecrix") || message.includes("thank you so much for your assistance sir") || message.includes("thank you so much for your assistance maanam") || message.includes("thank you so much for your assistance tecrix") || message.includes("thank you so much for your assistance sir") || message.includes("thank you so much for your assistance maanam") || message.includes("thank you so much for your assistance tecrix") || message.includes("thank you so much for your assistance sir")){
    speak("You're welcome, Sir!");
}
// Volume Control (Optional)
else if (message.includes("speak slower")) {
    speak("Sure, I will speak slower.");
    text_speak.rate = 0.5;
} else if (message.includes("speak faster")) {
    speak("Sure, I will speak faster.");
    text_speak.rate = 1.5;
} else if (message.includes("increase volume")) {
    speak("Sure, I will increase the volume.");
    text_speak.volume = 1;
} else if (message.includes("decrease volume")) {
    speak("Sure, I will decrease the volume.");
    text_speak.volume = 0.5;
}

else if (message.includes("hi") || message.includes("hello") || message.includes("hey") || message.includes("hola") || message.includes("namaste") || message.includes("hay")) {
    speak("Hello Maanam sir, How can I help you?");
}

// Exit Command (Optional)
else if (message.includes("exit") || message.includes("close") || message.includes("quit")) {
    speak("Goodbye, Sir! See you soon.");
    window.close(); // This will close the current window (if permitted by the browser)
}

    // Search query
    else {
        let searchQuery = message
            .replace("search", "")
            .replace("find", "")
            .replace("hello techie", "")
            .replace("hey techie", "")
            .replace("hi techie", "")
            .replace("teki", "")
            .trim(); // Clean up the message to extract the search query
    
        // Inform the user you're searching
        speak(`This is what I found for you on the internet for: ${searchQuery}`);
    
        // Call the function to fetch and read the first result
        fetchGoogleSearchResult(searchQuery);
    }
    
 
    
    
}

function fetchGoogleSearchResult(query) {
    const apiKey = 'AIzaSyBdj7MwfdqGrlLjGdHZchgYiSHlaLhdPTw'; // Your API key
    const cx = '7491931f0fb89414b'; // Your Custom Search Engine ID

    // Open the search in a new tab immediately
    window.open(`https://www.google.com/search?q=${query}`);

    fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.items && data.items.length > 0) {
                let firstResult = data.items[0];
                let snippet = firstResult.snippet;
                speak(`According to Google, ${snippet}`);
            } else {
                speak("I couldn't find anything relevant on Google.");
            }
        })
        .catch(error => {
            speak("Sorry, I encountered an error fetching the search results.");
        });
}

