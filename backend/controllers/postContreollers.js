import generateTokenAndSetCookie from "../helpers/generateTokenAnsSetCookie.js";
import User from "../models/userModel.js"
import bcrypt from "bcryptjs";
import Post from "../models/postModel.js";
import {v2 as cloudinary} from "cloudinary";
cloudinary.config({ 
    cloud_name:"detkhgdpl", 
    api_key:"231157324488881", 
    api_secret: "8opyc8KKSoUSrxw7yvTfWIp6UGk" 
  });
const createPost = async (req, res) => {
	try {
		const { postedBy, text } = req.body;
		const { img } = req.body;

        console.log('Image Before Upload:', img);
		if (!postedBy || !text) {
			return res.status(400).json({ error: "Postedby and text fields are required" });
		}

		const user = await User.findById(postedBy);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
        if (img) {
            try {
                const uploadedImgResponse = await cloudinary.uploader.upload(img);
                img = uploadedImgResponse.secure_url;
                console.log('Image After Upload:', img);
            } catch (uploadError) {
                console.error('Error Uploading Image to Cloudinary:', uploadError);
                return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
            }
        }


		if (user._id.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to create post" });
		}

		const maxLength = 500;
		if (text.length > maxLength) {
			return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
		}

		

		const newPost = new Post({ postedBy, text, img });
		await newPost.save();

		res.status(201).json(newPost);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log(err);
	}
};


const getPost = async (req, res) => {
    try {
        const post=await Post.findById(req.params.id);
        if(!post)
        {
            return res.status(404).json({error:"Post not found"});
        };
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({error:err.message});
    }
};


const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to delete post" });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error("Error in deletePost:", err);
        res.status(500).json({ error: err.message });
    }
};

const likeUnlikePost = async (req, res) => {
    try {
        const {id:postId} = req.params;
        const userId = req.user._id;
        const post = await Post.findById(postId);
        if(!post)
        {
            return res.status(404).json({error:"Post not found"});
        }
        const userLikedPost = post.likes.includes(userId);
        if(userLikedPost)
        {
             //unlike
             await Post.updateOne({_id:postId},{$pull:{likes:userId}});
             res.status(200).json({message:"Post unliked successfully"});
        }
        else{
             //like
             post.likes.push(userId);
             await post.save();
             res.status(200).json({message:"Post liked successfully"});
        }
    } catch (error) {
        res.status(500).json({error:error.message});
    }
};

const replyToPost =async  (req, res) => {  
    try {
        const {text}=req.body;
        const postId=req.params.id;
        const userId=req.user._id;
        const userProfilePic=req.user.profilePic;
        const username=req.user.username;
        if(!text)
        {
            return res.status(400).json({error:"Text field is required"});
        }
        const post=await Post.findById(postId);
        if(!post)
        {
            return res.status(404).json({error:"Post not found"});
        };
        const reply={text,userId,userProfilePic,username};
        post.replies.push(reply);
        await post.save();
        res.status(201).json(reply);
    } catch (error) {
         res.status(500).json({error:error.message});
    }
 };

 const getFeed = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
        console.log(user);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const following = user.following;

		const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });

		res.status(200).json(feedPosts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// const getUserPosts = async (req, res) => {
// 	const { username } = req.params;
// 	try {
// 		const user = await User.findOne({ username });
// 		if (!user) {
// 			return res.status(404).json({ error: "User not found" });
// 		}

// 		const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

// 		res.status(200).json(posts);
// 	} catch (error) {
// 		res.status(500).json({ error: error.message });
// 	}
// };

const getUserPost =async(req,res)=>{
      const{username}= req.params;
      try {
        const user=await User.findOne({username});
        if(!user)
        {
            return res.status(404).json({error:"User not found"});
        }
        const posts=await Post.find({postedBy:user._id}).sort({createdAt:-1});
        res.status(200).json(posts);
      } catch (error) {
         res.status(500).json({error:error.message});
      }
}





export {createPost,getPost,deletePost,likeUnlikePost,replyToPost,getFeed,getUserPost};