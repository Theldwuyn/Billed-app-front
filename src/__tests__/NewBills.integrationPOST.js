/**
 * @jest-environment jsdom
 */

import { localStorageMock } from "../__mocks__/localStorage";
import { screen, fireEvent } from "@testing-library/dom"
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event";

// Test d'intégration POST

// mock of '../app/Store.js' to replace the import of Store in Router.js
// by mockStore
jest.mock('../app/Store.js', () => mockStore)

// The line "await new Promise(process.nextTick)" is necessary to get through
// the loading page
describe("Given I am connected as an employee", () => {
    describe("When I fill the form and click on submit button", () => {
        test("Then a new bill is created and send to the server with the API", async() => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem("user", JSON.stringify({
                type: "Employee",
                email: "a@a"
            }))

            const spyUpdate = jest.spyOn(mockStore.bills(), "update")
            const spyCreate = jest.spyOn(mockStore.bills(), "create")

            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()

            window.onNavigate(ROUTES_PATH["Bills"])
            await new Promise(process.nextTick)

            window.onNavigate(ROUTES_PATH["NewBill"])

            // required input
            const expenseTypeInput = screen.getByTestId("expense-type")
            const datePickerInput = screen.getByTestId("datepicker")
            const amountInput = screen.getByTestId("amount")
            const pctInput = screen.getByTestId("pct")
            const fileInput = screen.getByTestId("file")

            fireEvent.change(expenseTypeInput, { target: { value: 'Transports' } })
            fireEvent.change(datePickerInput, { target: { value: '2001-01-01' } })
            fireEvent.change(amountInput, { target: { value: 200 } })
            fireEvent.change(pctInput, { target: { value: 20 } })

            // uploading an accepted file (jpg, jpeg or png)
            const file = new File(["foo"], "foo.jpg", { type: 'image/jpeg' })
            userEvent.upload(fileInput, file)

            const submitFormBtn = screen.getByText("Envoyer")
            userEvent.click(submitFormBtn)
            await new Promise(process.nextTick)

            expect(spyUpdate).toHaveBeenCalled
            expect(spyCreate).toHaveBeenCalled

            const pageTitle = screen.getByText("Mes notes de frais")
            expect(pageTitle).toBeTruthy()
        })
    })
})