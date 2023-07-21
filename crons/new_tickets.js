const mysql = require('mysql');


const admin_send_email = require('../notifications/new_tickets/agents/send_email');
const administrator_send_email = require('../notifications/new_tickets/administrator/send_email')
const new_tickets = (req, res) => {
    const connection = mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database
    });
    const date1 = new Date();
    connection.query('SELECT * from tickets where status_id = 1', (err, tickets) => {
        connection.query('SELECT * from users', (err, users) => {
            connection.query('SELECT * from users where user_type="Administrator"', (err, agents) => {
                connection.query('SELECT * from users where user_type="Administrator"', (err, administrators) => {
                    let past_array = []
                    console.log(tickets)
                    console.log(1)
                    tickets.map((ticket) => {
                        let filter = users.filter((x) => {
                            return parseInt(x.id) === parseInt(ticket.requester_id)
                        })
                        console.log(2)

                        if (filter.length > 0) {


                            const date2 = new Date(ticket.created_at);

                            // Calculate the difference in milliseconds
                            const differenceMs = Math.abs(date2.getTime() - date1.getTime());

                            // Convert milliseconds to hours, minutes, and seconds
                            const differenceHours = Math.floor(differenceMs / (1000 * 60 * 60));
                            const differenceMinutes = Math.floor((differenceMs % (1000 * 60 * 60)) / (1000 * 60));
                            const differenceSeconds = Math.floor((differenceMs % (1000 * 60)) / 1000);
                            console.log(4)
                            console.log(ticket.id, differenceHours, differenceMinutes)
                            if (differenceHours <= 2) {
                                if (parseInt(differenceHours) === 0 && parseInt(differenceMinutes) === 15) { // Admin
                                    admin_send_email(filter[0], ticket, differenceMinutes, agents, 'minutes')
                                }
                                else if (parseInt(differenceHours) === 0 && parseInt(differenceMinutes) === 30) { // Admin
                                    admin_send_email(filter[0], ticket, differenceMinutes, agents, 'minutes')
                                }
                                else if (parseInt(differenceHours) === 1 && parseInt(differenceMinutes) === 0) { // Admin + HOD
                                    admin_send_email(filter[0], ticket, differenceHours, agents, 'hrs')
                                }
                                else if (parseInt(differenceHours) === 2 && parseInt(differenceMinutes) === 0) { // Admin + HOD + GM
                                    admin_send_email(filter[0], ticket, differenceHours, agents, 'hrs')
                                }
                            }
                            else if (differenceHours > 2) { // HOD , Admin, GM
                                let obj = {
                                    ticket: ticket,
                                    user: filter[0]
                                }
                                past_array.push(obj);
                            }
                        }


                    })
                    setTimeout(() => {
                        let date = new Date()
                        let minute = date.getMinutes();
                        if (parseInt(minute) === 40) {
                            if (past_array.length > 0) {
                                administrator_send_email(past_array, agents, administrators)
                            }
                        }
                    }, 10000)
                })
            })



        })
    });
}
module.exports = new_tickets