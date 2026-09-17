# Architecture boundary

Browser clients may use public credentials, but privileged database mutation should be mediated by narrowly authorized server-side code. Custom tokens must be validated server-side during the transition.