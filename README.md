# Netflix App

## Project Overview

The project is structued in the following manner:

| File/Folder | Purpose                                                                   |
| ----------- | ------------------------------------------------------------------------- |
| App.js      | Defines the NetflixApp, which is the starting point for our application   |
| components  | The various UI components that are needed by this application             |
| framework   | A naive UI framework to simply the development                            |
| state       | Abstraction around state management and general purpose data manipulation |
| utilities   | General helper functions and libraries                                    |

> The styles have been scoped to the component with the exception of the ones on the body and the pixels have been switched out to using rem instead.

## Running the project

1. Clone the repository
2. In the root folder of the clone repo, run `yarn`
3. Run `yarn start` and open [http://localhost:5000](http://localhost:5000) to view it in the browser.
4. The project has only been tested on Chrome or new Edge.

## Approach

### Initial approach

At first, I started laying out the DOM manually just to test what each of the provided css styles do and how to use them in cohesion. I was done with that phase pretty quickly and then decided to start building it dynamically

### Old JS/jQuery ways

Before React/Angular/Backbone/Ember, jQuery reigned king. One thought was to do down that path via `documen.querySelector` and use the behavior pattern to add behaviours to the various components. This was sufficient to get the job done for the task at hand but is hard to maintain, grow and customize to the kind of scales front end application grow to, nowadays.

### Let's build a Framework

So to solve the above problem, I thought what would it take to build a basic UI framework. I needed to define the following:

1. **Registration:** A way for components to register themselves and tap into lifecycle methods
2. **Change Detection:** A way for the component framework to create and monitor components for changes in props or state and re-render them accordingly
3. **Reconciliation:** A way for the component framework update the DOM in the most performant way possible

### But why a framework in the first place?

Well depends on the problem but generally, UI frameworks allow developers to focus more on the problems they are trying to solve and the logic that is needed rather than focussing on the repetitive tasks around reacting to props, state and lifecycle events. It componentizes code by providing an easy way to leverge separation of concerns and abstractions and there by allow us to scale the code as we go along.

It makes the DOM manipulation patterns consistent and focuses on repeatablity which greatly improves reliability.

Also it was a definitely fun challenge for me to pursue :) [ but in product, let's use an established framework :P ]

### Registration

This is the easiset to code as it focuses more on API surface we need to have. So stuff like being able to register lifecyle events, rendering format, being able to add event handlers, passing props, all the good stuff. Basically the appraoch was to code something in thin air and hope it will work. Then fill in the framework code to make the consumer code work. I feel this approach to API building empathises with the consumer rather then the framework developer.

### Change Detection - Part 1

First idea, use a `MutationObserver` to help keep track of when components are added and removed and when their props changed. Started prototyping this and realized that there's so many edge cases to get this done in a reasonable timelimit. So bailed on this appraoch.

### Change Detection - Part deux

The previous idea was good but it took a lot of effort to get it right for all the various cases I wanted to handle. Instead the better model was to use something that the browser natively supports, which is web components.

> I have never worked with web components and had heard about them only in passing. So I did a quick crash course and spent sometime working on implementing some basic components before I settled on this appraoch. If I broke some rules on this, I am sorry!.

Web components were great, had a lot of the stuff that I was looking for minus some caveats, which I'll save for the onsite.

### RECONCILIATION

Well now we have some to the most important part of a UI framework today, update the DOM as little as possible. Unfortunately, in the interest of time and sanity and scope, I choose to use a naive way of using `Node.isEqualNode` which is utter crap as it checks the children as well. A better appraoch would be to use an AST parser and represent the DOM in that format and diff it node by node, not children. Just a basic tree difference. Then for each of the different nodes, do the work that is needed to barely update the UI instead of stomping the entire parent DOM.

While this is a fun exercise on it's own, it's more work to get it done right. So this way was an acceptable trade of for the current scope.

### Completing the project

With the above ready, it was only a matter of defining the new components and getting them to play nice. The rest got over pretty quickly. For state management, I created a hypothetical inmemory state (an object) but allow querying from that instead of querying from data repeatedly, to showcase how this would sort of work in a real world application.

## Areas of improvement

1. Progressive loading of information and progressive rendering
2. If we stick with the custom framework, rendering performance with a better reconciler
3. Using something like fela instead of repeated styles
4. Depending upon the scope, a whole lot of stuff that we can get to in the interview
