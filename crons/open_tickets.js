const mysql = require('mysql');

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
const agent_send_email = require('../notifications/open_tickets/agents/send_email');
const midnight_email = require('../notifications/open_tickets/agents/midnight_email')
const open_tickets = (req, res) => {
    const connection = mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database
    });
    const date1 = new Date();

    const date = new Date();
    const year = date.getFullYear();

    const hour = addZero(date.getHours())
    const minute = addZero(date.getMinutes())

    const mid_night = hour + ":" + minute;

    connection.query('SELECT * from tickets where status_id = 2', (err, tickets) => {
        connection.query('SELECT * from users', (err, users) => {
            connection.query('SELECT * from users where user_type="Agent"', (err, agents) => {
                connection.query('SELECT * from users where user_type="Agent"', (err, administrators) => {
                    let past_array = []

                    tickets.map((ticket) => {

                        let filter = users.filter((x) => {
                            return parseInt(x.id) === parseInt(ticket.solver_id)
                        })

                        if (filter.length > 0) {


                            const date2 = new Date(ticket.updated_at);

                            // Calculate the difference in milliseconds
                            const differenceMs = Math.abs(date2.getTime() - date1.getTime());

                            // Convert milliseconds to hours, minutes, and seconds
                            const differenceHours = Math.floor(differenceMs / (1000 * 60 * 60));
                            const differenceMinutes = Math.floor((differenceMs % (1000 * 60 * 60)) / (1000 * 60));
                            const differenceSeconds = Math.floor((differenceMs % (1000 * 60)) / 1000);
                            if (differenceHours < 8) {
                                let cc = []
                                if (parseInt(differenceHours) === 2 && parseInt(differenceMinutes) === 0) // AGENT
                                {
                                    agent_send_email(filter[0], ticket, differenceHours, 'hrs', cc)
                                }
                                else if (parseInt(differenceHours) === 4 && parseInt(differenceMinutes) === 0) // AGENT
                                {
                                    agent_send_email(filter[0], ticket, differenceHours, 'hrs', cc)
                                }
                                else if (parseInt(differenceHours) === 8 && parseInt(differenceMinutes) === 0) // AGENT , HOD
                                {
                                    cc = 'i.kagechu@tierdata.co.ke'
                                    agent_send_email(filter[0], ticket, differenceHours, 'hrs', cc)
                                }
                                else if (parseInt(differenceHours) === 16 && parseInt(differenceMinutes) === 0) // Agent , HOD
                                {
                                    cc = 'i.kagechu@tierdata.co.ke'
                                    agent_send_email(filter[0], ticket, differenceHours, 'hrs', cc)
                                }
                                else if (parseInt(differenceHours) === 24 && parseInt(differenceMinutes) === 0) // GM , HOD , AGENT
                                {
                                    cc = ['i.kagechu@tierdata.co.ke', 's.karechi@tierdata.co.ke']
                                    agent_send_email(filter[0], ticket, differenceHours, 'hrs', cc)
                                }
                            }

                        }


                    })

                    if (mid_night === '23:59') {
                        let cc = ['i.kagechu@tierdata.co.ke', 's.karechi@tierdata.co.ke']
                        agents.map((agent) => {
                            let dataArray = [];
                            let filter = tickets.filter((item) => {
                                return parseInt(item.solver_id) === parseInt(agent.id)
                            })
                            if (filter.length > 0) {
                                dataArray = filter;

                                midnight_email(dataArray, agent, cc)


                            }
                        })
                    }



                })
            })



        })
    });
}
module.exports = open_tickets