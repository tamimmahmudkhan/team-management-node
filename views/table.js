var socket = io()

var position;

socket.on('message', (message) => {
    console.log(`emit received : ${message}`)
    var mssg = JSON.parse(message)
    document.getElementById('msg').value += `${mssg.name}: ${mssg.message} \n`
})

socket.on('staff-refresh', () => {
    updateStaffTable()
})

socket.on('team-refresh', () => {
    updateTeamTable()
})

socket.on('project-refresh', () => {
    updateProjectTable()
})


function getMessages() {
    var msg = fetch('/chat')

    const msgs = msg.json()

    msgs.forEach((mssage) => {
        document.getElementById('msg').value += `${mssage.name}: ${mssage.message}`
    })
}

function sendMessage() {
    var message = { 'mssg': document.getElementById('chat-message').value };
    fetch('/chat', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
    })
}

function displayInfo(what, position, tableRow) {
    var form, tableHeaders;

    switch (what) { //Check what table is being displayed
        case 0: //STAFF Table
            form = document.getElementById('staffInfo')
            tableHeaders = document.getElementById('staffHeaders')
            break;
        case 1: //Team Table
            form = document.getElementById('teamInfo')
            tableHeaders = document.getElementById('teamHeaders')
            break;
        case 2: //Project Table
            form = document.getElementById('projectInfo')
            tableHeaders = document.getElementById('projectHeaders')
            break;
    }

    if (form.hasChildNodes()) { //Form was added by previous onclick invocation
        //Check if admin is logged in
        if (position == 'Admin') {  //If admin then allow editing 
            var inputs = form.getElementsByTagName('input');
            for (var i = 0; i < tableRow.cells.length; i++) {
                inputs[i].value = tableRow.cells[i].innerHTML
                if(inputs[i].name == 'id'){
                    inputs[i].disabled = true;
                }
            }
        } else { //Else only display information
            var labels = form.getElementsByTagName('label')
            for (var i = 0; i < tableRow.cells.length; i++) {
                labels[i].innerHTML = `${tableHeaders.cells[i].innerHTML}: ${tableRow.cells[i].innerHTML}`
            }
        }
    } else { //Add child nodes
        if (position == 'Admin') { //If admin then add both labels and inputs for ease of use
            for (var i = 0; i < tableRow.cells.length; i++) {
                var input = document.createElement('input')
                input.type = 'text'
                input.className = 'form-control'
                input.name = tableHeaders.cells[i].innerHTML.replace(/\s/g, "").toLowerCase();

                if(input.name == 'id'){
                    input.disabled = true;
                }

                input.value = tableRow.cells[i].innerHTML
                const label = document.createElement('label')
                label.innerHTML = tableHeaders.cells[i].innerHTML

                form.appendChild(label)
                form.appendChild(input)
            }

            var editBtn = document.createElement('button')
            editBtn.onclick = function(){refreshTable(what, form)}
            editBtn.className = 'btn btn-primary'
            editBtn.innerText = "Edit"

            form.appendChild(editBtn)
        } else { //Employee only gets to view the information. No editing allowed
            for (var i = 0; i < tableRow.cells.length; i++) {
                const label = document.createElement('label')
                label.className = 'form-control'
                label.innerHTML = `${tableHeaders.cells[i].innerHTML}: ${tableRow.cells[i].innerHTML}`
                form.appendChild(label)
            }
        }
    }
    form.className = 'form-group visible'
}

function refreshTable(what, form) {
    var url;
    var inputs = form.getElementsByTagName('input')

    var data= '{ ';
    for(var i=0; i <inputs.length-1; i++){
        console.log(data)
         data += `"${inputs[i].name}": "${inputs[i].value}",\n`
         console.log(data)
    }

    data += `"${inputs[i].name}": "${inputs[i].value}"}`

    console.log(data)

    var nope = JSON.parse(data)

    switch (what) { //Check what table is being displayed
        case 0: //STAFF Table
            url = "/staff-edit"
            break;
        case 1: //Team Table
            url = "/team-edit"
            break;
        case 2: //Project Table
            url = "/project-edit"
            break;
    }

    fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(nope)
    })
}

async function updateChat() {
    var msg = await fetch("/chat")
    const messages = await msg.json()

    var textArea = document.getElementById("msg");

    messages.forEach((msage) => {
        textArea.value += `${msage.name}: ${msage.message} \n`
    })
}

async function updateTeamTable() {
    var data = await fetch("/data-team")
    var teams = await data.json()

    var teamRows = document.getElementById('teamRows')

    while(teamRows.hasChildNodes()){
        teamRows.removeChild(teamRows.firstChild)
    }

    teams.forEach((team) => {
        var newRow = document.createElement('tr')
        newRow.onclick = function () {
            displayInfo(1, position, newRow)
        }

        var id = document.createElement('td')
        var name = document.createElement('td')
        var member = document.createElement('td')
        var project = document.createElement('td')

        id.innerHTML = team._id;
        name.innerHTML = team.name;
        member.innerHTML = team.members;
        project.innerHTML = team.project;

        newRow.appendChild(id)
        newRow.appendChild(name)
        newRow.appendChild(member)
        newRow.appendChild(project)

        teamRows.appendChild(newRow)
    })
}

async function updateProjectTable() {
    var data = await fetch("/data-project")
    var projects = await data.json()

    var projectRows = document.getElementById('projectRows')

    while(projectRows.hasChildNodes()){
        projectRows.removeChild(projectRows.firstChild)
    }

    projects.forEach((project) => {

        var newRow = document.createElement('tr')
        newRow.onclick = function () {
            displayInfo(2, position, newRow)
        }

        var id = document.createElement('td')
        var name = document.createElement('td')
        var status = document.createElement('td')
        var team = document.createElement('td')

        id.innerHTML = project._id
        name.innerHTML = project.name;
        status.innerHTML = project.status;
        team.innerHTML = project.team;

        newRow.appendChild(id)
        newRow.appendChild(name)
        newRow.appendChild(status)
        newRow.appendChild(team)

        projectRows.appendChild(newRow)

    })
}

async function updateStaffTable() {

    var data = await fetch("/data-staff")

    console.log(data)

    const staffs = await data.json()

    var staffRows = document.getElementById('staffRows');

        while(staffRows.hasChildNodes()){
            staffRows.removeChild(staffRows.firstChild)
        }

    staffs.forEach(staff => {
        var newRow = document.createElement('tr')
        newRow.onclick = function () {
            displayInfo(0, position, newRow)
        }

        var id = document.createElement('td')
        var name = document.createElement('td')
        var dob = document.createElement('td')
        var pos = document.createElement('td')
        var email = document.createElement('td')
        var work = document.createElement('td')
        var absent = document.createElement('td')
        var team = document.createElement('td')
        var project = document.createElement('td')

        id.innerHTML = staff._id
        name.innerHTML = `${staff.fname} ${staff.lname}`;
        dob.innerHTML = staff.dob;
        pos.innerHTML = staff.position
        email.innerHTML = staff.email
        work.innerHTML = staff.workDays
        absent.innerHTML = staff.absentDays
        team.innerHTML = staff.team
        project.innerHTML = staff.project

        newRow.appendChild(id)
        newRow.appendChild(name)
        newRow.appendChild(dob)
        newRow.appendChild(pos)
        newRow.appendChild(email)
        newRow.appendChild(work)
        newRow.appendChild(absent)
        newRow.appendChild(team)
        newRow.appendChild(project)

        staffRows.appendChild(newRow)
    });
}

async function getCurentUser() {
    var data = await fetch('/current')
    current = await data.json()
    position = current.position
    console.log(`Cookie data is : ${position}`)
}

getCurentUser();
updateStaffTable()
updateTeamTable()
updateProjectTable()
updateChat();
