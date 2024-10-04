/**
 * @jest-environment jsdom
 */

import { localStorageMock } from "../__mocks__/localStorage";
import { screen, within } from "@testing-library/dom"
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import "@testing-library/jest-dom"

// Test d'intégration GET

// mock of '../app/Store.js' to replace the import of Store in Router.js
// by mockStore
jest.mock('../app/Store.js', () => mockStore)

// The line "await new Promise(process.nextTick)" is necessary to get through
// the loading page

describe("Given I am connected as an employee", () => {
    describe("When I navigate to Bills page", () => {
        test("Then bills are fetched from mock API GET", async() => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem("user", JSON.stringify({
                type: "Employee",
                email: "a@a"
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()
            window.onNavigate(ROUTES_PATH['Bills'])
            await new Promise(process.nextTick)

            const billsTable = screen.getByTestId("tbody")
            expect(within(billsTable).getAllByRole("row")).toHaveLength(4)
        })
        describe("When an error occurs on API", () => {
            beforeEach(() => {
                jest.spyOn(mockStore, "bills")
                Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                window.localStorage.setItem("user", JSON.stringify({
                    type: "Employee",
                    email: "a@a"
                }))
                const root = document.createElement("div")
                root.setAttribute("id", "root")
                document.body.appendChild(root)
                router()
            })
            afterAll(() => {
                jest.clearAllMocks
            })

            test("fetches bills fails with error 404", async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list : () => {
                            return Promise.reject(new Error("Erreur 404"))
                        }
                    }
                })
                window.onNavigate(ROUTES_PATH['Bills'])
                await new Promise(process.nextTick)
                const message = screen.getByText(/Erreur 404/)
                expect(message).toBeTruthy()
            })
            test("fetches bills fails with error 500", async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list : () => {
                            return Promise.reject(new Error("Erreur 500"))
                        }
                    }
                })
                window.onNavigate(ROUTES_PATH['Bills'])
                await new Promise(process.nextTick)
                const message = screen.getByText(/Erreur 500/)
                expect(message).toBeTruthy()
            })
        })
    })
})
