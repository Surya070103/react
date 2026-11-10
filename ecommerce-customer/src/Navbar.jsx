import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { assets } from '../assets/assets';

const Navbar = () => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative flex items-center gap-6">
            <img src={assets.logo} alt="logo" />

            <NavLink to='/'>
                <p>Products</p>
            </NavLink>

            <NavLink to='/wishlist'>
                <p>wishlist</p>
            </NavLink>

            <NavLink to='/cart'>
                <p>cart</p>
            </NavLink>

            <NavLink to='/orders'>
                <p>orders</p>
            </NavLink>
            <NavLink to='/Logout'>
                <p>Logout</p>
            </NavLink>


            <div className="flex items-center gap-6">
                <img src={assets.search_icon} className="w-5 cursor-pointer" alt="" />
                <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>Products</div>
                <p className='cursor-pointer hover:text-black'>wishlist</p>
                <p className='cursor-pointer hover:text-black'>cart</p>
                <p className='cursor-pointer hover:text-black'>orders</p>
                <p className='cursor-pointer hover:text-black'>Login</p>

            </div>
            <button type="button" onClick={() => setVisible(true)} aria-label="Open navigation menu">
                ☰
            </button>
            <Link to='/cart' className='relative'>
                <img src={assets.cart_icon} className='w-5 min-5' alt="" />
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text center loading-4 bg-black text-white aspect-square rounded-full text-[8px]'>

                </p>
            </Link>

            <div className={`fixed top-0 right-0 bottom-0 z-50 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
                <div className='flex flex-col text-gray-600'>
                    <button type="button" onClick={() => setVisible(false)} className='flex items-center gap-4 p-3'>
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                        <span>Back</span>
                    </button>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/'>Products</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/collections'>wishlist</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/about'>cart</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact'>orders</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact'>Logout</NavLink>
                </div>
            </div>
        </div>
    );
};

export default Navbar;