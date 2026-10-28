import { useEffect, useState } from "react";

import api from "../services/api";

function Employees() {

    const [employees, setEmployees] = useState([]);

    useEffect(() => {

        const fetchEmployees = async () => {

            try {

                const response =
                    await api.get("/employees");

                setEmployees(response.data);

            } catch (error) {

                console.error(error);

            }
        };

        fetchEmployees();

    }, []);


    return (

        <div>

            <h1>Employees</h1>

            {employees.map((employee) => (

                <div key={employee._id}>

                    <h3>
                        {employee.name}
                    </h3>

                    <p>
                        Employee ID:
                        {employee.employeeId}
                    </p>

                    <p>
                        Department:
                        {employee.department}
                    </p>

                    <p>
                        Designation:
                        {employee.designation}
                    </p>

                    <hr />

                </div>

            ))}

        </div>
    );
}

export default Employees;