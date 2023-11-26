import express from 'express'
import conn from './db.js'
import jwt from 'jsonwebtoken'
const router=express.Router()

router.post("/login",(req,res)=>{
    const sql="SELECT * from login Where email = ? and password = ?"
    // console.log(req.body.email,req.body.password)
    conn.query(sql,[req.body.email,req.body.password],(err,result)=>{
        if(err) return res.json({loginStatus:false,Error:err})
        if(result.length >0){
            const email=result[0].email;
            const token=jwt.sign({role:"admin",email:email},"jwt_secret_key",{expiresIn:"1d"}
            
            );
            res.cookie('token',token)
            return res.json({loginStatus:true,Error:"connected"})
        }else{
            
            return res.json({loginStatus:false,Error:"Wrong credentials"})
        }
    })

})
router.post("/adminlogin",(req,res)=>{
    const sql="SELECT * from login Where email = ? and password = ?"
    // console.log(req.body.email,req.body.password)
    conn.query(sql,[req.body.email,req.body.password],(err,result)=>{
        if(err) return res.json({loginStatus:false,Error:err})
        if(result.length >0 && result[0].role === "admin"){
            const email=result[0].email;
            const token=jwt.sign({role:"admin",email:email},"jwt_secret_key",{expiresIn:"1d"}
            
            );
            res.cookie('token',token)
            return res.json({loginStatus:true,Error:"connected"})
        }else{
            
            return res.json({loginStatus:false,Error:"Wrong credentials"})
        }
    })

})
router.post("/signup", (req, res) => {
    // Check if the email already exists in the database
    const checkEmailSql = "SELECT * FROM login WHERE email = ?";
    conn.query(checkEmailSql, [req.body.email], (err, result) => {
        if (err) return res.json({ loginStatus: false, Error: err });

        if (result.length > 0) {
            // Email already exists, return an error
            return res.json({ loginStatus: false, Error: "Email already exists" });
        } else {
            // Email doesn't exist, proceed with signup
            const insertSql = "INSERT INTO login (email, password) VALUES (?, ?)";
            conn.query(insertSql, [req.body.email, req.body.password], (err, result) => {
                if (err) return res.json({ loginStatus: false, Error: err });

                // Signup successful, generate token and set cookie
                const email = req.body.email;
                const token = jwt.sign({ role: "admin", email: email }, "jwt_secret_key", { expiresIn: "1d" });
                res.cookie('token', token);
                return res.json({ loginStatus: true, Error: "Signup successful" });
            });
        }
    });
});







router.get('/employee', (req, res) => {
    const sql = "SELECT employee.*, station.station_name FROM employee JOIN station ON employee.station_id = station.station_id";
    conn.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})
router.get('/station', (req, res) => {
    const sql = "SELECT * FROM station";
    conn.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})
router.get('/train', (req, res) => {
    const sql = "SELECT * FROM train";
    conn.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})
router.post("/add_employee", (req, res) => {
    const stationQuery = "SELECT station_id FROM station WHERE station_name = ?";
    const stationValues = [req.body.station_name];

    // Query the station table to get station_id
    conn.query(stationQuery, stationValues, (stationErr, stationResult) => {
        if (stationErr) {
            console.log(stationErr);
            return res.json({ Status: false, Error: stationErr });
        }

        // Check if a matching station was found
        if (stationResult.length === 0) {
            return res.json({ Status: false, Error: "Station not found" });
        }

        // Extract the station_id from the result
        const stationId = stationResult[0].station_id;

        // Use the obtained station_id in the employee insert query
        const employeeInsertQuery = `
            INSERT INTO employee 
            (employee_name, station_id, functional_area, gender, salary, phoneNumber) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const employeeValues = [
            req.body.name,
            stationId, // Use the obtained station_id here
            req.body.functionalArea,
            req.body.gender,
            req.body.salary,
            req.body.phoneNumber,
        ];

        // Execute the employee insert query
        conn.query(employeeInsertQuery, employeeValues, (employeeErr, employeeResult) => {
            if (employeeErr) {
                console.log(employeeErr);
                return res.json({ Status: false, Error: employeeErr });
            }

            return res.json({ Status: true });
        });
    });
});

// router.post("/add_employee", (req, res) => {
//     const employeeSql = `INSERT INTO employee 
//       (employee_name, station_name, functional_area, gender, salary) 
//       VALUES (?, ?, ?, ?, ?)`;
  
//     const phoneSql = `INSERT INTO phone 
//       (id, phoneno) 
//       VALUES (?, ?), (?, ?), (?, ?), ...`; // Repeat (?, ?) for each phone number
  
//     const employeeValues = [
//       req.body.name,
//       req.body.station_name,
//       req.body.functionalArea,
//       req.body.gender,
//       req.body.salary,
//     ];
  
//     conn.query(employeeSql, employeeValues, (err, result) => {
//       if (err) {
//         console.log(err);
//         return res.json({ Status: false, Error: err });
//       }
  
//       const employeeId = result.insertId;
  
//       // Insert phone numbers into the phone table
//       const phoneNumbers = req.body.phoneNumber || [];
  
//       if (phoneNumbers.length > 0) {
//         const placeholders = phoneNumbers.map(() => "(?, ?)").join(", ");
//         const phoneValues = phoneNumbers.flat();
  
//         const completePhoneSql = `INSERT INTO phone (id, phoneno) VALUES ${placeholders}`;
        
//         conn.query(completePhoneSql, [employeeId, ...phoneValues], (phoneErr) => {
//           if (phoneErr) {
//             console.log(phoneErr);
//             return res.json({ Status: false, Error: phoneErr });
//           }
  
//           return res.json({ Status: true });
//         });
//       } else {
//         return res.json({ Status: true });
//       }
//     });
//   });
  
  router.post("/add_station", (req, res) => {
    const sql = `INSERT INTO station 
      (station_name) 
      VALUES (?)`;
  
    const values = [
      
      req.body.station_name,
      
    ];
  
    conn.query(sql, values, (err, result) => {
      if (err) {
        console.log(err)
        return res.json({ Status: false, Error: err });
      }
      return res.json({ Status: true });
    });
  });
  router.post("/add_train", (req, res) => {
    const sql = `INSERT INTO train 
      (start_station, end_station, start_time,end_time) 
      VALUES (?, ?, ?, ?)`;
  
    const values = [
      req.body.start_station,
      req.body.end_station,
      req.body.start_time,
      req.body.end_time
    ];
  
    conn.query(sql, values, (err, result) => {
      if (err) {
        console.log(err)
        return res.json({ Status: false, Error: err });
      }
      return res.json({ Status: true });
    });
  });

  router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = `
        SELECT employee.*, station.station_name 
        FROM employee 
        JOIN station ON employee.station_id = station.station_id
        WHERE employee.employee_id = ?`;
    conn.query(sql, [id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" });
        if (result.length === 0) {
            return res.json({ Status: false, Error: "Employee not found" });
        }
        return res.json({ Status: true, Result: result });
    });
});


router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;

    // Query the station table to get station_id
    const stationQuery = "SELECT station_id FROM station WHERE station_name = ?";
    const stationValues = [req.body.station_name];

    conn.query(stationQuery, stationValues, (stationErr, stationResult) => {
        if (stationErr) {
            console.log(stationErr);
            return res.json({ Status: false, Error: stationErr });
        }

        // Check if a matching station was found
        if (stationResult.length === 0) {
            return res.json({ Status: false, Error: "Station not found" });
        }

        // Extract the station_id from the result
        const stationId = stationResult[0].station_id;

        // Use the obtained station_id in the employee update query
        const updateQuery = `
            UPDATE employee 
            SET employee_name = ?, station_id = ?, functional_area = ?, gender = ?, salary = ?, phoneNumber = ? 
            WHERE employee_id = ?
        `;

        const updateValues = [
            req.body.name,
            stationId, // Use the obtained station_id here
            req.body.functional_area,
            req.body.gender,
            req.body.salary,
            req.body.phoneNumber,
            id,
        ];

        // Execute the employee update query
        conn.query(updateQuery, updateValues, (err, result) => {
            if (err) return res.json({ Status: false, Error: "Query Error" });
            if (result.affectedRows === 0) {
                return res.json({ Status: false, Error: "Employee not found" });
            }
            return res.json({ Status: true, Result: result });
        });
    });
});
router.get('/train/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM train WHERE train_id = ?";
    conn.query(sql, [id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" });
        if (result.length === 0) {
            return res.json({ Status: false, Error: "Employee not found" });
        }
        return res.json({ Status: true, Result: result });
    });
});


router.put('/edit_train/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE train 
        set start_station = ?, end_station = ?,start_time = ?, end_time = ?
        WHERE train_id = ?`;
    const values = [
        req.body.start_station,
      req.body.end_station,
      req.body.start_time,
      req.body.end_time,
        id,
    ];
    conn.query(sql, values, (err, result) => {
        if (err) return res.json({ Status: false, Error: "Station not found" });
        if (result.affectedRows === 0) {
            return res.json({ Status: false, Error: "Train not found" });
        }
        return res.json({ Status: true, Result: result });
    });
});

router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM employee WHERE employee_id = ?";
    conn.query(sql, [id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" });
        if (result.affectedRows === 0) {
            return res.json({ Status: false, Error: "Employee not found" });
        }
        return res.json({ Status: true, Result: result });
    });
});
router.delete('/delete_station/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM station WHERE station_id = ?";
    conn.query(sql, [id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" });
        if (result.affectedRows === 0) {
            return res.json({ Status: false, Error: "Station not found" });
        }
        return res.json({ Status: true, Result: result });
    });
});
router.delete('/delete_train/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM train WHERE train_id = ?";
    conn.query(sql, [id], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query Error" });
        if (result.affectedRows === 0) {
            return res.json({ Status: false, Error: "Train not found" });
        }
        return res.json({ Status: true, Result: result });
    });
});

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})


router.post('/ticket', (req, res) => {
    const { price, start, end, password, email, time, type } = req.body;
  
    // Step 1: Retrieve user_id from the login table based on email and password
    const loginQuery = 'SELECT id FROM login WHERE email = ? AND password = ?';
    const loginValues = [email, password];
  
    conn.query(loginQuery, loginValues, (loginErr, loginResult) => {
      if (loginErr) {
        console.error(loginErr);
        return res.json({ Status: false, Error: 'Login Query Error' });
      }
  
      // Check if a matching user was found
      if (loginResult.length === 0) {
        return res.json({ Status: false, Error: 'Invalid email or password' });
      }
  
      // Extract the user_id from the login result
      const userId = loginResult[0].id;
  
      // Step 2: Insert data into the ticket table using the retrieved user_id
      const ticketInsertQuery = `
        INSERT INTO ticket (price, from_S, to_S, user_id, bought_time, type)
        VALUES (?, ?, ?, ?, NOW(), ?)
      `;
  
      const ticketInsertValues = [price, start, end, userId, type];
  
      conn.query(ticketInsertQuery, ticketInsertValues, (ticketErr, ticketResult) => {
        if (ticketErr) {
          console.error(ticketErr);
          return res.json({ Status: false, Error: 'Ticket Insert Error' });
        }
  
        return res.json({ Status: true, Result: ticketResult });
      });
    });
  });

  router.get('/employeePerStation', (req, res) => {
    const storedProcedureQuery = 'CALL no_of_employee_per_station()';
  
    conn.query(storedProcedureQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ Status: false, Error: 'Error executing stored procedure' });
      }
  
      return res.json({ Status: true, Result: result[0] });
    });
  });

  router.get('/employeePerStation', (req, res) => {
    const storedProcedureQuery = 'CALL no_of_employee_per_station()';
  
    conn.query(storedProcedureQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ Status: false, Error: 'Error executing stored procedure' });
      }
  
      return res.json({ Status: true, Result: result[0] });
    });
  });

  router.get('/employeeAboveAvgSalary', (req, res) => {
    const storedProcedureQuery = 'call employee_above_avg_salary()';
  
    conn.query(storedProcedureQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ Status: false, Error: 'Error executing stored procedure' });
      }
  
      console.log(result[0])
  
      return res.json({ Status: true,  Result: result[0]});
    });
  });
  router.post('/calculateRevenue',(req,res)=>{
    const { userid, tickettype } = req.body;

  const query = `
    SELECT revenue_from_user_specific_ticket_type(${userid}, '${tickettype}') AS totalRevenue;
  `;

  conn.query(query, (err, result) => {
    if (err) {
      console.error(err);
      return res.json({ Status: false, Error: 'Error calculating revenue' });
    }

    const totalRevenue = result[0].totalRevenue;
    return res.json({ Status: true, Result: totalRevenue });
  });
  })


  router.post('/totalTickets', (req, res) => {
    const { station } = req.body;
  
    const query = `
      SELECT no_of_tickets_bought_at_a_station('${station}') AS totalTickets;
    `;
  
    conn.query(query, (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ Status: false, Error: 'Error calculating total tickets' });
      }
  
      const totalTickets = result[0].totalTickets;
      return res.json({ Status: true, Result: totalTickets });
    });
  });


  router.post('/mytickets', (req, res) => {
    const { email, password } = req.body;
  
    // Step 1: Retrieve user_id from the login table based on email and password
    const loginQuery = 'SELECT id FROM login WHERE email = ? AND password = ?';
    const loginValues = [email, password];
  
    conn.query(loginQuery, loginValues, (loginErr, loginResult) => {
      if (loginErr) {
        console.error(loginErr);
        return res.json({ Status: false, Error: 'Login Query Error' });
      }
  
      // Check if a matching user was found
      if (loginResult.length === 0) {
        return res.json({ Status: false, Error: 'Invalid email or password' });
      }
  
      // Extract the user_id from the login result
      const userId = loginResult[0].id;
  
      // Step 2: Retrieve ticket details for the user using the retrieved user_id
      const ticketQuery = `
        SELECT * FROM ticket
        WHERE user_id = ?
      `;
  
      conn.query(ticketQuery, [userId], (ticketErr, ticketResult) => {
        if (ticketErr) {
          console.error(ticketErr);
          return res.json({ Status: false, Error: 'Ticket Query Error' });
        }
  
        return res.json({ Status: true, Result: ticketResult });
      });
    });
  });

  router.get('/ticketlist', (req, res) => {
    const selectViewQuery = `
      SELECT * FROM ticket;
    `;
  
    conn.query(selectViewQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ Status: false, Error: 'Error selecting from view' });
      }
  
      return res.json({ Status: true, Result: result });
    });
  });
export {router as adminRouter}