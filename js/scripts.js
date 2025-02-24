// Custom Cursor (Only for Desktop)
const cursor = document.createElement('div');
cursor.classList.add('custom-cursor');
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 768) { // Only active on desktop
        cursor.style.left = `${e.clientX - cursor.offsetWidth / 2}px`;
        cursor.style.top = `${e.clientY - cursor.offsetHeight / 2}px`;
    }
});

const name = document.getElementById('name');
name.addEventListener('mouseenter', () => {
    if (window.innerWidth > 768) {
        cursor.classList.add('hover');
    }
});
name.addEventListener('mouseleave', () => {
    if (window.innerWidth > 768) {
        cursor.classList.remove('hover');
    }
});

// Smooth Scroll for Navigation
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        window.scrollTo({
            top: targetSection.offsetTop - 80,
            behavior: 'smooth'
        });
        // Close mobile menu after clicking
        if (window.innerWidth <= 768) {
            navLinks.classList.remove('active');
        }
    });
});

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});