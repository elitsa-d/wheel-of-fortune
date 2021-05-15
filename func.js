class Wheel {
    constructor(numOfSections, diameter) {
        this.numOfSections = numOfSections;
        this.radius = diameter / 2;
        this.sectionStart = 0;                  //Angle at which a section starts in radians
        this.arc = (2 * PI) / numOfSections;    //Size of one section
        this.currentPosition = 0;               //Current angle at which the wheel is rotated in radians
        this.targetPosition = 0;                //Target angle to rotate the wheel to in radians
        this.velocity = 0;                      //Rate  at which the wheel rotates
        this.specialState = false;              //Special state of rotation


        //Colors and text for the wheel
        this.sections = [
            { text: '$0', color: '#A6B8B5' },        
            { text: '$1000', color: '#FD255C' },
            { text: '$20', color: '#B8E719' },
            { text: '$200', color: '#45E7FE' },
            { text: '$80', color : '#A58AFF' },
            { text: 'BONUS', color : '#E42DFB' },
            { text: '$5', color: '#EFD477' },
            { text: '$500', color : '#F97E31' },
            { text: '$1', color: '#A6B8B5' },
            { text: '$20000', color: '#FD255C' },
            { text: '$50', color : '#B8E719' },
            { text: '$350', color : '#45E7FE' },
            { text: '$100', color : '#A58AFF' },
            { text: 'Surprise', color : '#E42DFB' },
            { text: '$10', color: '#EFD477' },
            { text: '$777', color : '#F97E31' },
        ];

        //Start button
        this.startBtn = document.querySelector('.startBtn');

    }

    drawSection(index, context) {
        this.sectionStart = this.arc * index;
        context.save(); 
    
        //Draw background of one section
        context.beginPath();
        context.fillStyle = this.sections[index].color;
        context.strokeStyle = this.sections[index].color;
        context.moveTo(this.radius, this.radius);
        context.arc(this.radius, this.radius, this.radius, this.sectionStart, this.sectionStart + this.arc);
        context.lineTo(this.radius, this.radius);
        context.stroke();
        context.fill();
    
        //Add text to the section
        context.translate(this.radius, this.radius);
        context.rotate(this.sectionStart + (this.arc / 2));
        context.fillStyle = '#fff';
        context.textAlign = 'right';
        context.font = 'bold 24px sans-serif';
        context.shadowColor = "black";
        context.shadowBlur = 3;
        context.lineWidth = 1;
        context.strokeText(this.sections[index].text, this.radius - 15, 10);
        context.fillText(this.sections[index].text, this.radius - 15, 10);
        context.restore();
    }

    //Rotating wheel to a friction of the given angle
    //When the angle is decreasing the friction becomes smaller 
    //This creates an illusion of decreasing speed
    rotate(angle, context) {
        this.velocity = angle / 40;
        this.currentPosition += this.velocity;
        context.canvas.style.transform = 'rotate(' + this.currentPosition + 'rad)';
    }

    stop() {
        this.velocity = 0;                              
        this.targetPosition %= (2 * PI);                //Normalize angle
        this.currentPosition = this.targetPosition;     //Current position reaches target position
        this.startBtn.innerHTML = "Start";
    }
}

//Select html elements
const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
const diameter = context.canvas.width;
const tableContent = document.querySelector('.results tbody');
const tableData = document.getElementsByTagName('td');
const specialBtn = document.querySelector('.specialBtn');
const PI = Math.PI;


//Define wheel
const numOfSections = 16;
let wheel = new Wheel(numOfSections, diameter);


//Draw sections
for(let i = 0; i < wheel.numOfSections; i++) {
    wheel.drawSection(i, context);
}


//Fill in result table - default state
wheel.sections.forEach(section => {
    tableContent.innerHTML += `<tr><th>${section.text}: </th><td>${0}</td></tr>`;       //For every section add a row in the table
    tableContent.lastChild.style.background = section.color;                            //Give corresponding color to the last added row
});




//Handle wheel behaviour

let winSection = -1;            //Index of the winning section
let sectionPoint = -1;          //A point in the winning section (in radians)
let cycles = -1;                //Number of cycles the wheel does while rotating
let specialArr = [];            //Array for predefined winning sections in special state
let specialCount = 0;           //Current round in special state
const specialRounds = 10;       //Number of total rounds to be played in special state
const repeatX = 2;              //Times for X section to win in special state
const repeatY = 3;              //Times for Y section to win in special state



//Start the wheel on clicking start button

wheel.startBtn.addEventListener('click', function() {
    if (wheel.currentPosition === wheel.targetPosition) {               //If wheel is not rotating

        if(!wheel.specialState) {                                       //When in normal state
            winSection = getSectionIndex(wheel.numOfSections);          //Choose random winning section
        } else {                                                        //When in special state
            winSection = specialArr[specialCount];                      //Take winning section from pedefined winning sections
            specialCount++;

            if(specialCount >= specialRounds) {                         //When all rounds in special state are played
                wheel.specialState = false;                             //Deactivate special state
                specialBtn.classList.remove('active');   
                specialCount = 0;
            }
        }

        sectionPoint = getPoint(winSection);                            //Define random point in the winning section to rotate to
        cycles = Math.floor(random(2, 3));                              //Define number of cycles for the current round
        wheel.targetPosition = sectionPoint + cycles * PI * 2;          //Start rotation by giving new target to the wheel (in radians)
        this.innerHTML = "?";                                           //Change text in the start button while rotating
    }
});


//Activate / deactivate special state on clicking special button
specialBtn.addEventListener('click', function() {                                   
    if (this.classList.contains('active')) {                                        
        wheel.specialState = false;
        this.classList.remove('active');
        specialCount = 0;
    } else {
        this.classList.add('active');
        wheel.specialState = true;                                                  //On active special state
        specialArr = generateSpecialSections(specialRounds, repeatX, repeatY);      //Generate array with predefined winning sections for next N rounds
    }
});


// Animating the rotation
function animateRotation() {
    let angle = 0;
    if (wheel.currentPosition !== wheel.targetPosition) {                       //When wheel receives new target
        angle = calcAngle(wheel.currentPosition, wheel.targetPosition);         //Find angle between current position and target position in radians
        wheel.rotate(angle, context);                                           //Start rotation 

        if (angle < 0.01) {                                                     //When current position is close enough to the target
            wheel.stop();                                                       //Stop rotation
            updateTable(tableData, winSection);                                 //And update table
            
        }
    }

    requestAnimationFrame(animateRotation);
}

animateRotation();



/*
    FUNCTIONS
*/

//Return random number in range between first and second argument
function random(min, max) {
    return Math.random() * (max - min) + min;
} 


/*
First parameter is the number of sections to choose from
Second parameter is optional, it represents the index of a section 
The returned index will always be different than the second parameter
Function returns the index of a random section
*/
function getSectionIndex(max, x = 0) {
    let num = Math.floor(Math.random() * max); 

    if (num === x) {                           
        return getSectionIndex(max, x);
    }

    return num;
}



/*
Takes index of a section
Calculates the starting and ending point of its arc
Returns a random point between them
*/
function getPoint(index) {
    let min = (wheel.numOfSections - index - 1) * wheel.arc + 0.005;  
    let max = (wheel.numOfSections - index) * wheel.arc - 0.005;      
    return random(min, max);        
}



/*
First parameter represents the number of total values to be generated
Second parameter represents the times one of the values should be repeated
Third parameter represents the times another one of the values should to be repeated
Returns array with two random repeating values such that non-unique values are not adjacent
*/

function generateSpecialSections(count, xRepeat, yRepeat) {
    let sections = [];
    let uniqueValues = count - (xRepeat + yRepeat) + 2;   

    //Generate all unique values
    while(sections.length < uniqueValues) {
        let n = getSectionIndex(wheel.numOfSections);

        if(!sections.includes(n)) {
            sections.push(n);
        }
    }

    //Choose two unique values
    let x = getSectionIndex(uniqueValues);
    let y = getSectionIndex(uniqueValues, x);


    //Add them to the sections array n times
    repeatValue(sections[x], xRepeat, sections);
    repeatValue(sections[y], yRepeat, sections);

    //Rearrange the final array so that the non-unique values are not adjacent
    rearrangeArr(sections);

    return sections;
}


/*
First parameter is the value to be repeated
Second parameter is how many times should it be present in the array
Third parameter is the array to be modified
Returns the same array, modified, with the specified value repeating n times
*/
function repeatValue(value, n, arr) {
    for(let i = 0; i < n - 1; i++) {
        arr.push(value);
    }
    
    return arr;
}


/*
Takes array to modify so that any non-unique values are not adjacent
*/
function rearrangeArr(arr) {
    let temp, newIndex;

    for(let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {                                
            temp = arr[i];                                          

            do {                
                newIndex = getSectionIndex(arr.length - 1);         
            } while(arr[newIndex - 1] === temp || arr[newIndex] === temp || arr[newIndex + 1] === temp || arr[newIndex] === arr[i - 1]);

            arr[i] = arr[newIndex];
            arr[newIndex] = temp;
        }
    }
}



/*
Takes two points on a circle in radians
Calculates the size of the angle between the two points (couterclockwise from 'startPosition' to 'endPosition')
Returns the angle in radians 
*/

function calcAngle(startPosition, endPosition) {
    let angle = 0;

    if(endPosition < startPosition) {
        angle = PI * 2 - Math.abs(endPosition - startPosition);
    } else if(endPosition > startPosition) {
        angle = endPosition - startPosition;
    }

    return angle;
}


/*
Takes HTML collection and index number
Modifies the element on the specified index
By converting its text to integer 
And incrementing its value by one
*/

function updateTable(data, index) {
    let result = parseInt(data[index].textContent);
    result += 1;                                  
    data[index].textContent = result;    
}



